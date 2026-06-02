// ================================================================
// FILE: backend/src/controllers/authController.js
// ACTION: Poora file REPLACE karo iss se
// Kya add hua: forgotPassword + resetPassword functions
// ================================================================

const bcrypt = require('bcryptjs');
const crypto = require('crypto');          // ← NEW (Node built-in, no install needed)
const prisma  = require('../config/db');
const config  = require('../config/env');
const { signToken }          = require('../utils/jwt');
const { success, error }     = require('../utils/response');
const { sendEmail, templates } = require('../utils/email');

const safeUser = ({ password, ...u }) => u;
const isAdmin  = (email) => email.toLowerCase() === config.admin.email;

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const normalEmail = email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalEmail } });
    if (exists) return error(res, 'Account already exists with this email', 409);

    const hashed = await bcrypt.hash(password, 12);
    const user   = await prisma.user.create({
      data: { name, email: normalEmail, password: hashed, role: isAdmin(normalEmail) ? 'ADMIN' : 'USER' },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    sendEmail(user.email, `🦷 Welcome to ${config.clinic.name}!`, templates.welcome(user.name));
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
    if (!user)          return error(res, 'No account found with this email', 401);
    if (!user.password) return error(res, 'This account uses Google login', 401);
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return error(res, 'Incorrect password', 401);

    const token = signToken({ id: user.id, email: user.email, role: user.role });
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
    return success(res, { user: safeUser(user) });
  } catch (e) {
    return error(res, 'Could not fetch user');
  }
}

// ── NEW: POST /api/auth/forgot-password ──────────────────────────
// User apna email deta hai → reset link email pe aata hai
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 400);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Security: same response chahe user mile ya na mile
    // (taaki attacker ko pata na chale kaunsa email registered hai)
    if (!user || !user.password) {
      return success(res, {}, 'If this email exists, a reset link has been sent.');
    }

    // Random secure token generate karo
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Token hash karke DB mein save karo
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken:  hashedToken,
        resetExpiry: resetExpiry,
      },
    });

    // Reset link banao
    const frontendUrl = config.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl    = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Email bhejo
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
          <p style="color: #666; font-size: 13px;">
            Or copy this link: <a href="${resetUrl}" style="color: #0B6E68;">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Samarth Dental Care · Vijapur, Mehsana, Gujarat</p>
        </div>
      `
    );

    return success(res, {}, 'If this email exists, a reset link has been sent.');
  } catch (e) {
    console.error('[forgotPassword]', e);
    return error(res, 'Could not send reset email. Please try again.');
  }
}

// ── NEW: POST /api/auth/reset-password ──────────────────────────
// User token + naya password deta hai → password update hota hai
async function resetPassword(req, res) {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return error(res, 'Token, email and new password are required', 400);
    if (password.length < 6)
      return error(res, 'Password must be at least 6 characters', 400);

    // Token hash karo aur DB mein dhundho
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        email:       email.toLowerCase(),
        resetToken:  hashedToken,
        resetExpiry: { gt: new Date() },   // expiry check
      },
    });

    if (!user) return error(res, 'Invalid or expired reset link. Please request a new one.', 400);

    // Naya password hash karo aur token clear karo
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:    hashed,
        resetToken:  null,
        resetExpiry: null,
      },
    });

    return success(res, {}, 'Password reset successful! You can now login.');
  } catch (e) {
    console.error('[resetPassword]', e);
    return error(res, 'Password reset failed. Please try again.');
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

module.exports = { signup, login, getMe, seedAdmin, forgotPassword, resetPassword };