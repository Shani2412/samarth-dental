const https = require('https');

const INSTANCE_ID = process.env.GREENAPI_INSTANCE_ID;
const API_TOKEN   = process.env.GREENAPI_TOKEN;
const API_URL     = process.env.GREENAPI_API_URL || 'https://7107.api.greenapi.com';

async function sendWhatsApp(toNumber, message) {
  if (!INSTANCE_ID || !API_TOKEN) {
    console.log('[WhatsApp] Not configured — skipping');
    return;
  }

  // Format number — must be 91XXXXXXXXXX@c.us
  const chatId = toNumber.replace(/[^0-9]/g, '') + '@c.us';

  const body = JSON.stringify({ chatId, message });
  const url  = `${API_URL}/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`;

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('[WhatsApp] Sent:', res.statusCode, data);
        resolve(data);
      });
    });
    req.on('error', e => {
      console.error('[WhatsApp Error]', e.message);
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

// Booking notification to doctor
async function notifyNewBooking({ name, phone, service, date, time, message }) {
  const doctorNumber = process.env.GREENAPI_RECEIVER;
  if (!doctorNumber) return;

  const msg = [
    `🦷 *New Booking — Samarth Dental*`,
    ``,
    `👤 *Patient:* ${name}`,
    `📞 *Phone:* ${phone}`,
    `🔧 *Service:* ${service}`,
    date ? `📅 *Date:* ${date}` : null,
    time ? `⏰ *Time:* ${time}` : null,
    message ? `💬 *Note:* ${message}` : null,
    ``,
    `_Please confirm or call the patient._`,
  ].filter(Boolean).join('\n');

  await sendWhatsApp(doctorNumber, msg);
}

// Confirmation notification to doctor
async function notifyBookingConfirmed({ name, phone, service, date, time }) {
  const doctorNumber = process.env.GREENAPI_RECEIVER;
  if (!doctorNumber) return;

  const msg = [
    `✅ *Appointment Confirmed — Samarth Dental*`,
    ``,
    `👤 *Patient:* ${name}`,
    `📞 *Phone:* ${phone}`,
    `🔧 *Service:* ${service}`,
    date ? `📅 *Date:* ${date}` : null,
    time ? `⏰ *Time:* ${time}` : null,
  ].filter(Boolean).join('\n');

  await sendWhatsApp(doctorNumber, msg);
}


// Booking confirmation to patient
async function notifyPatientBooking({ name, phone, service, date, time }) {
  if (!phone) return;

  // Format phone number
  let formatted = phone.replace(/[^0-9]/g, '');
  if (formatted.startsWith('0')) formatted = '91' + formatted.slice(1);
  if (!formatted.startsWith('91') && formatted.length === 10) formatted = '91' + formatted;

  const msg = [
    `✅ *Booking Confirmed — Samarth Dental Care*`,
    ``,
    `Dear *${name}*,`,
    `Your appointment has been received!`,
    ``,
    `🔧 *Service:* ${service}`,
    date ? `📅 *Date:* ${date}` : null,
    time ? `⏰ *Time:* ${time}` : null,
    ``,
    `📍 *Location:* 20/21 Dev Complex, Vijapur–Himmatnagar Highway, Near Anandpura, Vijapur`,
    ``,
    `We will confirm your appointment shortly.`,
    `For any queries, reply to this message.`,
    ``,
    `_— Samarth Dental Care, Vijapur_`,
  ].filter(Boolean).join('\n');

  await sendWhatsApp(formatted, msg);
}

// Appointment confirmed by admin — notify patient
async function notifyPatientConfirmed({ name, phone, service, date, time }) {
  if (!phone) return;

  let formatted = phone.replace(/[^0-9]/g, '');
  if (formatted.startsWith('0')) formatted = '91' + formatted.slice(1);
  if (!formatted.startsWith('91') && formatted.length === 10) formatted = '91' + formatted;

  const msg = [
    `🎉 *Appointment Confirmed — Samarth Dental Care*`,
    ``,
    `Dear *${name}*,`,
    `Your appointment has been *confirmed* by our team!`,
    ``,
    `🔧 *Service:* ${service}`,
    date ? `📅 *Date:* ${date}` : null,
    time ? `⏰ *Time:* ${time}` : null,
    ``,
    `📍 20/21 Dev Complex, Vijapur–Himmatnagar Highway`,
    `Near Anandpura, Vijapur, Gujarat 384570`,
    ``,
    `⚠️ Please arrive 10 minutes early.`,
    ``,
    `_— Samarth Dental Care, Vijapur_`,
  ].filter(Boolean).join('\n');

  await sendWhatsApp(formatted, msg);
}

module.exports = { sendWhatsApp, notifyNewBooking, notifyBookingConfirmed, notifyPatientBooking, notifyPatientConfirmed };
