// ================================================================
// FILE: backend/src/utils/email.js
// ACTION: Nodemailer hatao aur Resend ko wapas active karo
// ================================================================

// Agar aapne resend package install kiya hua h (npm i resend)
const { Resend } = require('resend');

// Aapki resend key `.env` se uthayega, nahi toh fallback local testing key
const resendKey = process.env.RESEND_API_KEY || 're_123456789'; 
const resend = new Resend(resendKey);

async function sendEmail(to, subject, html) {
  try {
    // Resend free tier par sirf "onboarding@resend.dev" se hi mail ja sakta hai
    // Jab tak aap apna domain verify nahi karte
    const data = await resend.emails.send({
      from: 'Samarth Dental <onboarding@resend.dev>',
      to: to.toLowerCase().trim(),
      subject: subject,
      html: html,
    });
    
    console.log(`📧 Resend API Success: Email sent to ${to}`, data);
    return data;
  } catch (e) {
    console.error('❌ [Resend Live Error]:', e.message);
    throw e;
  }
}

const templates = {
  welcome: (name) => `<h3>Welcome ${name} to Samarth Dental!</h3>`,
};

// Mismatch fix: Object format me hi export rahega
module.exports = { sendEmail, templates };