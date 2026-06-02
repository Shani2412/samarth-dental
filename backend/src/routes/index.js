// ================================================================
// FILE: backend/src/routes/index.js
// ACTION: Poora file REPLACE karo iss se
// Kya add hua: 2 naye routes — forgot-password + reset-password
// ================================================================

const router = require('express').Router();
const { authenticate, requireAdmin }     = require('../middleware/auth');
const { authLimiter, bookingLimiter }    = require('../middleware/rateLimiter');
const { validate, signupRules, loginRules, appointmentRules, reviewRules } = require('../middleware/validate');
const upload  = require('../middleware/upload');
const auth       = require('../controllers/authController');
const googleAuth = require('../controllers/googleAuthController');
const passport   = require('../middleware/passport');
const appt    = require('../controllers/appointmentController');
const other   = require('../controllers/otherControllers');
const photo   = require('../controllers/photoController');
const patient = require('../controllers/patientController');

// ── Auth ──
router.post('/auth/signup', authLimiter, signupRules, validate, auth.signup);
router.post('/auth/login',  authLimiter, loginRules,  validate, auth.login);
router.get('/auth/me',      authenticate, auth.getMe);

// ── NEW: Forgot / Reset Password ──
router.post('/auth/forgot-password', authLimiter, auth.forgotPassword);
router.post('/auth/reset-password',  auth.resetPassword);

// ── Google OAuth ──
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
  googleAuth.googleCallback
);

// ── Appointments (user) ──
router.post('/appointments',     authenticate, bookingLimiter, appointmentRules, validate, appt.create);
router.get('/appointments/my',   authenticate, appt.getMyAppointments);

// ── Appointments (admin) ──
router.get('/admin/appointments',        requireAdmin, appt.getAll);
router.patch('/admin/appointments/:id',  requireAdmin, appt.updateStatus);
router.delete('/admin/appointments/:id', requireAdmin, appt.remove);

// ── Reviews (public) ──
router.get('/reviews', other.getApproved);

// ── Reviews (user) ──
router.post('/reviews', authenticate, reviewRules, validate, other.createReview);

// ── Reviews (admin) ──
router.get('/admin/reviews',        requireAdmin, other.getAllReviews);
router.patch('/admin/reviews/:id',  requireAdmin, other.updateReview);
router.delete('/admin/reviews/:id', requireAdmin, other.deleteReview);

// ── Patient Records (patient) ──
router.get('/my-record', authenticate, patient.myRecord);

// ── Patient Records (admin) ──
router.get('/admin/patients',                       requireAdmin, patient.getAllPatients);
router.get('/admin/patients/:id',                   requireAdmin, patient.getPatient);
router.put('/admin/patients/:id/record',            requireAdmin, patient.upsertRecord);
router.post('/admin/patients/:id/visits',           requireAdmin, patient.addVisit);
router.patch('/admin/patients/:id/visits/:visitId', requireAdmin, patient.updateVisit);
router.delete('/admin/patients/:id/visits/:visitId',requireAdmin, patient.deleteVisit);

// ── Admin stats & users ──
router.get('/admin/stats',   requireAdmin, other.getStats);
router.get('/admin/reports', requireAdmin, other.getReports);
router.get('/admin/users',   requireAdmin, other.getAllUsers);

// ── Photos (public) ──
router.get('/photos', photo.getPhotos);

// ── Photos (admin only) ──
router.post('/admin/photos',        requireAdmin, upload.single('photo'), photo.uploadPhoto);
router.get('/admin/photos',         requireAdmin, photo.getAllPhotos);
router.patch('/admin/photos/:id',   requireAdmin, photo.updatePhoto);
router.delete('/admin/photos/:id',  requireAdmin, photo.deletePhoto);

module.exports = router;