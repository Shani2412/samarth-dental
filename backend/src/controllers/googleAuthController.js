const prisma     = require('../config/db');
const { signToken } = require('../utils/jwt');

// Called by passport after Google verifies user
async function googleCallback(req, res) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!req.user) return res.redirect(`${frontendUrl}/login?error=google_failed`);

    const { token, user } = req.user;
    // Redirect to frontend with token — frontend saves it
    const redirectUrl = `${frontendUrl}/auth/google/success?token=${token}&name=${encodeURIComponent(user.name)}&role=${user.role}&id=${user.id}`;
    res.redirect(redirectUrl);
  } catch (e) {
    console.error('[Google Auth]', e);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
  }
}

module.exports = { googleCallback };
