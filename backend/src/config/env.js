require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing env: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  port:        parseInt(process.env.PORT) || 5000,
  nodeEnv:     process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  jwt: {
    secret:    process.env.JWT_SECRET,
    expiresIn: '8h',
  },

  admin: {
    email:    (process.env.ADMIN_EMAIL || 'admin@samarthdental.com').toLowerCase(),
    password:  process.env.ADMIN_PASS  || 'samarth@123',
  },

  email: {
    user:        process.env.EMAIL_USER    || '',
    pass:        process.env.EMAIL_PASS    || '',
    clinicEmail: process.env.CLINIC_EMAIL  || '',
  },

  clinic: {
    name:    'Samarth Dental Care',
    phone:   process.env.CLINIC_PHONE || '919999999999',
    address: 'Vijapur, Mehsana, Gujarat',
  },
};
