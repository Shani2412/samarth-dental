// ================================================================
// FILE: backend/src/utils/email.js
// ACTION: Purane working Resend code ko bina badle sahi format me export karo
// ================================================================

const { Resend } = require('resend');

// Dashboard ya env se jo bhi key h, direct fetch hogi
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

async function sendEmail(to, subject, html) {
  try {
    // Aapka purana setup jisme custom domain verified tha aur sabko mail jata tha
    const data = await resend.emails.send({
      from: 'Samarth Dental <no-reply@samarthdentalcare.in>', // Aapka verified domain domain
      to: to.toLowerCase().trim(),
      subject: subject,
      html: html,
    });
    
    console.log(`📧 Resend Success: Link sent to ${to}`);
    return data;
  } catch (e) {
    console.error('❌ Resend API Error:', e.message);
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