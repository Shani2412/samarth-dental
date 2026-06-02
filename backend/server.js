const config  = require('./src/config/env');
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const fs      = require('fs');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { seedAdmin }  = require('./src/controllers/authController');

const app = express();

app.set('trust proxy', 1);

// ── Ensure uploads folder exists ──
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Middleware ──
// Render/production proxy trust
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin:         config.frontendUrl,
  credentials:    true,
  methods:        ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// ── Serve uploaded photos ──
app.use('/uploads', express.static(uploadsDir));

// ── Rate limiting ──
app.use('/api/', apiLimiter);

// ── API Routes ──
app.use('/api', require('./src/routes/index'));

// ── Health check ──
app.get('/health', (req, res) =>
  res.json({ success: true, status: 'OK', time: new Date().toISOString() })
);

// ── Multer error handler ──
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB allowed.' });
  if (err.message?.includes('Only image files'))
    return res.status(400).json({ success: false, message: err.message });
  console.error('[Error]', err);
  res.status(500).json({ success: false, message: config.isProduction ? 'Server error' : err.message });
});

// ── 404 ──
app.use((req, res) =>
  res.status(404).json({ success: false, message: `${req.method} ${req.path} not found` })
);

// ── Start ──
async function start() {
  try {
    const prisma = require('./src/config/db');
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');
    await seedAdmin();
    app.listen(config.port, () => {
      console.log(`\n🦷  Samarth Dental — Backend API`);
      console.log(`🚀  http://localhost:${config.port}`);
      console.log(`📁  Uploads: http://localhost:${config.port}/uploads/`);
      console.log(`📋  Health: http://localhost:${config.port}/health`);
      console.log(`🌐  Frontend: ${config.frontendUrl}\n`);
    });
  } catch (err) {
    console.error('❌ Start failed:', err.message);
    process.exit(1);
  }
}

start();
