const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma         = require('../config/db');
const { signToken }  = require('../utils/jwt');

const isAdmin = (email) =>
  email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const name  = profile.displayName || 'Google User';
    if (!email) return done(new Error('No email from Google'), null);

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email:    email.toLowerCase(),
          password: null,
          role:     isAdmin(email) ? 'ADMIN' : 'USER',
          googleId: profile.id,
        },
      });
    } else if (!user.googleId) {
      // Link Google to existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data:  { googleId: profile.id },
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const { password, ...safeUser } = user;
    return done(null, { token, user: safeUser });
  } catch (e) {
    console.error('[Passport Google]', e);
    return done(e, null);
  }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
