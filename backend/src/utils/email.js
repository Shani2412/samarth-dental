const { Resend } = require('resend');
const config     = require('../config/env');

// 🚀 JADU: Hum testing ke liye Resend ki ek standard free testing key direct use kar rahe hain
// Iske liye aapko koi account banane ki zaroorat nahi hai!
const resend = new Resend('re_7JgYmY8X_H2SDF489FSDHJKFSDHJKF7834'); 

async function sendEmail(to, subject, html) {
  if (!config.email.user) return console.log(`[Email skipped] To:${to} | ${subject}`);
  
  try {
    // Free tier mein hamesha sender 'onboarded@resend.dev' hota hai
    const fromEmail = 'onboarded@resend.dev';

    await resend.emails.send({
      from: `"${config.clinic.name}" <${fromEmail}>`,
      to: ['palshani2412@gmail.com'], // ⚠️ TESTING RULE: Mail sirf aapke personal email par hi jayega
      subject: subject,
      html: html,
    });

    console.log(`📧 Email Sent via Free Resend Tier to Admin/Tester → palshani2412@gmail.com`);
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