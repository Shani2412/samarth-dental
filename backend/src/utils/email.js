const nodemailer = require('nodemailer');
const config     = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: config.email.user, pass: config.email.pass },
});

async function sendEmail(to, subject, html) {
  if (!config.email.user) return console.log(`[Email skipped] To:${to} | ${subject}`);
  try {
    await transporter.sendMail({ from: `"${config.clinic.name}" <${config.email.user}>`, to, subject, html });
    console.log(`📧 Email → ${to}`);
  } catch (e) { console.error('[Email Error]', e.message); }
}

const templates = {
  welcome: (name) => `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
      <div style="background:#0B6E68;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">🦷 Welcome to Samarth Dental!</h1>
      </div>
      <div style="padding:28px 32px;background:white;border-radius:0 0 12px 12px;border:1px solid #E2E8F0">
        <p style="font-size:15px">Dear <strong>${name}</strong>, your account is ready!</p>
        <p style="font-size:14px;color:#718096">Book appointments, track status, and leave reviews from your dashboard.</p>
        <p style="margin-top:20px;font-size:13px;color:#718096">— ${config.clinic.name}, ${config.clinic.address}</p>
      </div>
    </div>`,

  appointmentReceived: (name, service, date, time) => `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
      <div style="background:#0B6E68;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">✅ Appointment Request Received</h1>
      </div>
      <div style="padding:24px 32px;background:white;border-radius:0 0 12px 12px;border:1px solid #E2E8F0">
        <p style="font-size:15px">Dear <strong>${name}</strong>,</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="background:#F9FAFB"><td style="padding:8px 12px;color:#718096">Service</td><td style="padding:8px 12px;font-weight:600">${service}</td></tr>
          <tr><td style="padding:8px 12px;color:#718096">Date</td><td style="padding:8px 12px">${date || 'TBD'}</td></tr>
          <tr style="background:#F9FAFB"><td style="padding:8px 12px;color:#718096">Time</td><td style="padding:8px 12px">${time || '—'}</td></tr>
          <tr><td style="padding:8px 12px;color:#718096">Status</td><td style="padding:8px 12px;color:#DD6B20;font-weight:600">⏳ Pending</td></tr>
        </table>
        <p style="font-size:13px;color:#718096;margin-top:16px">We will confirm your slot soon!</p>
      </div>
    </div>`,

  appointmentConfirmed: (name, service, date, time) => `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
      <div style="background:#38A169;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">🎉 Appointment Confirmed!</h1>
      </div>
      <div style="padding:24px 32px;background:white;border-radius:0 0 12px 12px;border:1px solid #E2E8F0">
        <p style="font-size:15px">Dear <strong>${name}</strong>, your appointment is confirmed!</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="background:#F0FFF4"><td style="padding:8px 12px;color:#718096">Service</td><td style="padding:8px 12px;font-weight:600">${service}</td></tr>
          <tr><td style="padding:8px 12px;color:#718096">Date</td><td style="padding:8px 12px;font-weight:700;color:#38A169">${date}</td></tr>
          <tr style="background:#F0FFF4"><td style="padding:8px 12px;color:#718096">Time</td><td style="padding:8px 12px;font-weight:700;color:#38A169">${time}</td></tr>
        </table>
        <p style="font-size:13px;color:#718096;margin-top:16px">📍 ${config.clinic.address}</p>
      </div>
    </div>`,

  newBookingAdmin: (p) => `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
      <div style="background:#0B6E68;padding:20px 28px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:18px">🦷 New Appointment — ${p.name}</h1>
      </div>
      <div style="padding:20px 28px;background:white;border-radius:0 0 12px 12px;border:1px solid #E2E8F0">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="background:#F9FAFB"><td style="padding:8px;color:#718096">Patient</td><td style="padding:8px;font-weight:600">${p.name}</td></tr>
          <tr><td style="padding:8px;color:#718096">Phone</td><td style="padding:8px">${p.phone}</td></tr>
          <tr style="background:#F9FAFB"><td style="padding:8px;color:#718096">Email</td><td style="padding:8px">${p.email}</td></tr>
          <tr><td style="padding:8px;color:#718096">Service</td><td style="padding:8px;font-weight:600;color:#0B6E68">${p.service}</td></tr>
          <tr style="background:#F9FAFB"><td style="padding:8px;color:#718096">Date</td><td style="padding:8px">${p.date || '—'}</td></tr>
          <tr><td style="padding:8px;color:#718096">Time</td><td style="padding:8px">${p.time || '—'}</td></tr>
          ${p.message ? `<tr style="background:#F9FAFB"><td style="padding:8px;color:#718096">Note</td><td style="padding:8px">${p.message}</td></tr>` : ''}
        </table>
      </div>
    </div>`,
};

module.exports = { sendEmail, templates };
