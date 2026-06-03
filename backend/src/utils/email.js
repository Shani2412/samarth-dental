// ================================================================
// FILE: backend/src/utils/email.js
// ACTION: Transporter configuration ko upgrade karo (Port 465 SSL)
// ================================================================

const nodemailer = require('nodemailer');

const smtpUser = process.env.EMAIL_USER || 'palshani2412@gmail.com';
const smtpPass = process.env.EMAIL_PASS || 'fcah gwnq dbfo lngf';

// ⚡ PRODUCTION FIX: Upgraded to Port 465 (SSL) to bypass Render's Port 587 block
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,         // 🔐 Port 587 block hai, isliye 465 use kar rahe hain
  secure: true,      // 465 ke liye secure hamesha true rahega
  auth: { 
    user: smtpUser, 
    pass: smtpPass
  },
  tls: {
    rejectUnauthorized: false // Local aur live server compatibility ke liye
  }
});

async function sendEmail(to, subject, html) {
  if (!smtpUser || !smtpPass) {
    console.error('❌ [Email Skipped] SMTP Credentials missing');
    return;
  }
  
  try {
    const info = await transporter.sendMail({ 
      from: `"Samarth Dental Care" <${smtpUser}>`, 
      to: to.toLowerCase().trim(), 
      subject, 
      html 
    });
    console.log(`📧 Email sent successfully! MessageID: ${info.messageId}`);
    return info;
  } catch (e) { 
    console.error('❌ [Live Email Server Error]:', e.message); 
    throw e; 
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
};

module.exports = { sendEmail, templates };