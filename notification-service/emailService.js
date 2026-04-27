const nodemailer = require('nodemailer');

// Configuration
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;

if (smtpUser && smtpPass) {
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log('✅ Nodemailer SMTP service initialized');
  } catch (err) {
    console.error('❌ Nodemailer initialization failed:', err.message);
  }
} else {
  console.log('⚠️ SMTP credentials missing. Using Mock Email Service.');
}

/**
 * Send an Email message
 * @param {string} to - The recipient's email address
 * @param {string} subject - The subject of the email
 * @param {string} htmlBody - The HTML content of the email
 */
const sendEmail = async (to, subject, htmlBody) => {
  if (!to) {
    console.log(`[Mock Email] Skipped: No email address provided for message "${subject}"`);
    return false;
  }

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Campus Lost & Found" <${smtpUser}>`,
        to,
        subject,
        html: htmlBody,
      });
      console.log(`📧 [Real Email] Sent to ${to}`);
      return true;
    } catch (err) {
      console.error(`📧❌ [Real Email] Failed to send to ${to}:`, err.message);
      return false;
    }
  } else {
    // Mock Email
    console.log('\n' + '='.repeat(50));
    console.log(`📧 [MOCK EMAIL] To: ${to}`);
    console.log(`📌 Subject: ${subject}`);
    console.log(`💬 Message: \n${htmlBody.replace(/<[^>]*>?/gm, '')}`); // Strip HTML for console logging
    console.log('='.repeat(50) + '\n');
    return true;
  }
};

/**
 * HTML Templates
 */
const templates = {
  itemFound: (title) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4ECDC4; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">🎉 Good News!</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Someone has found your lost item: <strong>${title}</strong>.</p>
        <p>Please log in to your Campus Lost & Found dashboard to review the claim and get in touch with the finder.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:3000/dashboard" style="background-color: #4ECDC4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
        </div>
      </div>
    </div>
  `,
  generalAlert: (title, message) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #FF6B6B; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">${title}</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>${message}</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:3000" style="background-color: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Open App</a>
        </div>
      </div>
    </div>
  `
};

module.exports = {
  sendEmail,
  templates
};
