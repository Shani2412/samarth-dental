// ================================================================
// FILE: backend/src/utils/email.js
// ACTION: Purane working Resend code ko bina badle sahi format me export karo
// ================================================================

const { Resend } = require('resend');

// Dashboard ya env se jo bhi key h, direct fetch hogi
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

async function sendEmail(to, subject, html) {
  try {
    const data = await resend.emails.send({
      from: 'Samarth Dental <onboarding@resend.dev>',
      to: to.toLowerCase().trim(),
      subject: subject,
      html: html,
    });

    console.log('====================');
    console.log('RESEND RESPONSE:', data);
    console.log('EMAIL TO:', to);
    console.log('====================');

    return data;
  } catch (e) {
    console.error('❌ RESEND FULL ERROR:', e);
    throw e;
  }
}

// Templates object jo authController mang raha h
const templates = {
  welcome: (name) => `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
      <h1 style="color:#0B6E68;">🦷 Welcome to Samarth Dental!</h1>
      <p>Dear <strong>${name}</strong>, your account is ready!</p>
    </div>`,
};

// 🚨 CRITICAL MATCH: Object export taaki authController me destructing fail na ho
module.exports = { sendEmail, templates };