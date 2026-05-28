const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const config = require('../config/env');
const { signToken }  = require('../utils/jwt');
const { success, error } = require('../utils/response');
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

module.exports = { signup, login, getMe, seedAdmin };
