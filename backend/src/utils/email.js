// ================================================================
// FILE: backend/src/utils/email.js
// ACTION: Iss code se purane Resend code ko REPLACE karo
// ================================================================

const nodemailer = require('nodemailer');
const config     = require('../config/env');

// Aapka direct nodemailer config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 587 ke liye false hi rahega
  auth: { 
    user: config.email.user || 'palshani2412@gmail.com', 
    pass: config.email.pass || 'fcah gwnq dbfo lngf' 
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

async function sendEmail(to, subject, html) {
  const targetUser = config.email.user || 'palshani2412@gmail.com';
  if (!targetUser) return console.log(`[Email skipped] To:${to} | ${subject}`);
  
  try {
    await transporter.sendMail({ 
      from: `"Samarth Dental" <${targetUser}>`, 
      to, 
      subject, 
      html 
    });
    console.log(`📧 Direct Email sent successfully → ${to}`);
  } catch (e) { 
    console.error('❌ [Email Error]', e.message); 
  }
}

const templates = {
  welcome: (name) => `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
      <div style="background:#0B6E68;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">🦷 Welcome to Samarth Dental!</h1>
      </div>
      <div style="padding:28px 32px;background:white;border-radius:0 0 12px 12px;border:1px solid #E2E8F0">
        <p style="font-size:15px">Dear <strong>${name}</strong>, your account is ready!</p>
        <p style="font-size:14px;color:#718096">Book appointments from your dashboard.</p>
      </div>
    </div>`,

  appointmentReceived: (name, service, date, time) => `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
      <div style="background:#0B6E68;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">✅ Request Received</h1>
      </div>
      <div style="padding:24px 32px;background:white;border-radius:0 0 12px 12px;border:1px solid #E2E8F0">
        <p style="font-size:15px">Dear <strong>${name}</strong>,</p>
        <p style="font-size:14px">We received your request for ${service}.</p>
      </div>
    </div>`,
};

module.exports = { sendEmail, templates };