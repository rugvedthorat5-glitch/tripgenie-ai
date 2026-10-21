require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 5050,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tripgenie',
  jwtSecret: process.env.JWT_SECRET || 'tripgenie-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@tripgenie.com').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@12345',
  adminName: process.env.ADMIN_NAME || 'Shraddha Pethkar',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'TripGenie AI <noreply@tripgenie.local>',
  },
  resetUrl: process.env.APP_RESET_URL || 'http://localhost:8081/reset',
  frontendOrigin: process.env.FRONTEND_ORIGIN || '*',
};

module.exports = config;
