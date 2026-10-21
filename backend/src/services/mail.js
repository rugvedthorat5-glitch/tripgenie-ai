const nodemailer = require('nodemailer');
const config = require('../config');

async function sendResetEmail(to, token) {
  const link = `${config.resetUrl}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;

  if (!config.smtp.host) {
    console.log('[TripGenie] Password reset (SMTP not configured):', { to, link, token });
    return { demo: true, link, token };
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: 'Reset your TripGenie AI password',
    text: `Reset your password using this link (valid 1 hour):\n\n${link}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Reset your TripGenie AI password:</p><p><a href="${link}">${link}</a></p><p>Valid for 1 hour.</p>`,
  });

  return { demo: false };
}

module.exports = { sendResetEmail };
