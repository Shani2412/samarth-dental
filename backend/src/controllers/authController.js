// ================================================================
// FILE: backend/src/controllers/authController.js
// ACTION: Poora file REPLACE karo iss se
// Kya fix hua: Multiple Admin capability AND Custom Admin Review Creator
// ================================================================

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/db');
const config = require('../config/env');
const { signToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');
const { sendEmail, templates } = require('../utils/email');

const safeUser = ({ password, ...u }) => u;

// ⚡ FIX: Ab hum multiple admins handle karne ke liye array checks ya dynamic scaling use kar sakte hain
const isAdminEmail = (email) => {
  const adminList = [
    config.admin.email.toLowerCase(),
    'palshani773@gmail.com' // 👈 Aapka naya approved admin email
  ];
  return adminList.includes(email.toLowerCase());
};

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const normalEmail = email.toLowerCase();
    
    // 1. Check if user exists
    const exists = await prisma.user.findUnique({ where: { email: normalEmail } });
    if (exists) return error(res, 'Account already exists with this email', 409);

    // 2. Hash Password and Create User
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { 
        name, 
        email: normalEmail, 
        password: hashed, 
        role: isAdminEmail(normalEmail) ? 'ADMIN' : 'USER' 
      },
    });

    // 3. Generate Token
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // 🔥 ULTIMATE FIX: Yahan se 'await' hata diya hai aur ise background me daal diya hai.
    sendEmail(user.email, `🦷 Welcome to ${config.clinic.name}!`, templates.welcome(user.name))
      .catch(mailErr => console.error('📧 Background Mail Error:', mailErr.message));

    // 4. Send Instant Success Response to Frontend
    return success(res, { token, user: safeUser(user) }, 'Account created!', 201);

  } catch (e) {
    console.error('[signup]', e);
    return error(res, 'Signup failed');
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return error(res, 'No account found with this email', 401);
    if (!user.password) return error(res, 'This account uses Google login', 401);
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return error(res, 'Incorrect password', 401);

    // 🔥 HIGHLY CRITICAL FIX: Token ke andar database se nikla hua real user.role pass hona chahiye
    const currentRole = isAdminEmail(user.email) ? 'ADMIN' : user.role;

    const token = signToken({ id: user.id, email: user.email, role: currentRole });
    
    user.role = currentRole;

    return success(res, { token, user: safeUser(user) }, 'Login successful');
  } catch (e) {
    console.error('[login]', e);
    return error(res, 'Login failed');
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return error(res, 'User not found', 404);
    
    if (isAdminEmail(user.email)) {
      user.role = 'ADMIN';
    }
    
    return success(res, { user: safeUser(user) });
  } catch (e) {
    return error(res, 'Could not fetch user');
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 400);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.password) {
      return success(res, {}, 'If this email exists, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetExpiry: resetExpiry,
      },
    });

    const frontendUrl = config.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    await sendEmail(
      user.email,
      '🔐 Reset Your Password — Samarth Dental Care',
      `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #0B6E68;">Reset Your Password</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password for your Samarth Dental Care account.</p>
          <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
              style="background-color: #0B6E68; color: white; padding: 14px 28px;
                     text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">
            If you didn't request this, please ignore this email. Your password will not change.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Samarth Dental Care · Vijapur, Mehsana, Gujarat</p>
        </div>
      `
    );

    return success(res, {}, 'If this email exists, a reset link has been sent.');
  } catch (e) {
    console.error('[forgotPassword]', e);
    return error(res, `Error: ${e.message || 'Could not send reset email'}`);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return error(res, 'Token, email and new password are required', 400);
    if (password.length < 6)
      return error(res, 'Password must be at least 6 characters', 400);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        resetToken: hashedToken,
        resetExpiry: { gt: new Date() },
      },
    });

    if (!user) return error(res, 'Invalid or expired reset link. Please request a new one.', 400);

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetExpiry: null,
      },
    });

    return success(res, {}, 'Password reset successful! You can now login.');
  } catch (e) {
    console.error('[resetPassword]', e);
    return error(res, 'Password reset failed. Please try again.');
  }
}

// 🌐 NEW ACTION: POST /api/auth/admin-review
// Yeh function aapko Google ke custom name aur location wale reviews direct database me safe karne dega
async function createAdminReview(req, res) {
  try {
    const { name, location, stars, text } = req.body;

    // Security check: Sirf login kiya hua admin hi ise access kar sakta hai
    if (!req.user || req.user.role !== 'ADMIN') {
      return error(res, 'Unauthorized: Only admins can add custom reviews', 403);
    }

    if (!name || !stars || !text) {
      return error(res, 'Name, stars, and review text are required', 400);
    }

    const review = await prisma.review.create({
      data: {
        name: name.trim(),
        location: location ? location.trim() : 'Vijapur',
        stars: Number(stars),
        text: text.trim(),
        userId: req.user.id // Admin ki user id backend logging ke liye safe rahegi
      }
    });

    return success(res, review, 'Google review added successfully!', 201);
  } catch (e) {
    console.error('[createAdminReview]', e);
    return error(res, 'Failed to insert custom review');
  }
}

// Seed admin on startup
async function seedAdmin() {
  try {
    const exists = await prisma.user.findUnique({ where: { email: config.admin.email } });
    if (!exists) {
      const hashed = await bcrypt.hash(config.admin.password, 12);
      await prisma.user.create({
        data: { name: 'Admin', email: config.admin.email, password: hashed, role: 'ADMIN' },
      });
      console.log(`✅ Admin created → ${config.admin.email}`);
    }
  } catch (e) { console.error('[seedAdmin]', e.message); }
}

// ✅ Export me createAdminReview ko include kiya hai
module.exports = { signup, login, getMe, seedAdmin, forgotPassword, resetPassword, createAdminReview };