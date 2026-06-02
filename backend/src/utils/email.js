const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = 'Samarth Dental Clinic <onboarding@resend.dev>';
const CLINIC = process.env.CLINIC_EMAIL || 'virupatel2794@gmail.com';

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set — skipping');
    return;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error('[Email Error]', error);
    else console.log('[Email] Sent to', to);
    return data;
  } catch (e) {
    console.error('[Email Error]', e.message);
  }
}

const templates = {
  appointmentConfirmed: (name, service, date, time) => ({
    subject: '✅ Appointment Confirmed — Samarth Dental Clinic',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#0B6E68">Appointment Confirmed! 🦷</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your appointment has been confirmed.</p>
        <div style="background:#f0faf9;border-radius:12px;padding:16px;margin:16px 0">
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${date || 'TBD'}</p>
          <p><strong>Time:</strong> ${time || 'TBD'}</p>
        </div>
        <p>📍 20/24 Dev Complex, Anandpura Char Rasta, Vijapur</p>
        <p>📞 +91 90331 42313</p>
        <p style="color:#888;font-size:12px">— Samarth Dental Clinic, Vijapur</p>
      </div>
    `,
  }),

  appointmentReceived: (name, service, date, time) => ({
    subject: '📅 Booking Received — Samarth Dental Clinic',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#0B6E68">Booking Received! 🦷</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We have received your appointment request.</p>
        <div style="background:#f0faf9;border-radius:12px;padding:16px;margin:16px 0">
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${date || 'TBD'}</p>
          <p><strong>Time:</strong> ${time || 'TBD'}</p>
        </div>
        <p>We will confirm your appointment shortly.</p>
        <p style="color:#888;font-size:12px">— Samarth Dental Clinic, Vijapur</p>
      </div>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔐 Reset Your Password — Samarth Dental Clinic',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#0B6E68">Reset Your Password 🔐</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetUrl}" style="background:#0B6E68;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
            Reset Password
          </a>
        </div>
        <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
        <p style="color:#888;font-size:12px">— Samarth Dental Clinic, Vijapur</p>
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates };
