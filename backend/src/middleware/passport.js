const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma         = require('../config/db');
const { signToken }  = require('../utils/jwt');

const isAdmin = (email) => {
  if (!email || !process.env.ADMIN_EMAIL) return false;
  return email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
};

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    const name  = profile.displayName || 'Google User';
    if (!email) return done(new Error('No email from Google'), null);

    // Find user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // ✅ FORCE FIXED: explicit string allocation taaki kisi tarah se database default null na uthaye
      const assignedRole = isAdmin(email) ? 'ADMIN' : 'USER';
      
      user = await prisma.user.create({
        data: {
          name,
          email,
          role: assignedRole,
          googleId: profile.id,
          // Note: prisma schema me password optional (?) hona chahiye tabhi null accept hoga
        },
      });
    } else {
      // ✅ SAFE FIX: Agar user pehle se hai par uska role database me galti se null ho gaya tha, toh use bhi sahi karo
      const assignedRole = user.role && user.role !== 'null' ? user.role : (isAdmin(email) ? 'ADMIN' : 'USER');
      
      user = await prisma.user.update({
        where: { id: user.id },
        data:  { 
          googleId: user.googleId || profile.id,
          role: assignedRole 
        },
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