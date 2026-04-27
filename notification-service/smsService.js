const twilio = require('twilio');

// Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken) {
  try {
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio SMS service initialized');
  } catch (err) {
    console.error('❌ Twilio initialization failed:', err.message);
  }
} else {
  console.log('⚠️ Twilio credentials missing. Using Mock SMS Service.');
}

/**
 * Send an SMS message
 * @param {string} to - The recipient's phone number
 * @param {string} body - The text message content
 */
const sendSMS = async (to, body) => {
  if (!to) {
    console.log(`[Mock SMS] Skipped: No phone number provided for message "${body}"`);
    return false;
  }

  // Normalize phone number to E.164 format (Default +91 for Nirma University)
  let formattedTo = to.trim();
  if (!formattedTo.startsWith('+')) {
    // If it's a 10 digit number, assume it's an Indian number
    if (formattedTo.length === 10) {
      formattedTo = '+91' + formattedTo;
    } else {
      // Otherwise fallback to +1 or just prepend +
      formattedTo = '+' + formattedTo;
    }
  }

  if (client && twilioNumber) {
    try {
      await client.messages.create({
        body,
        from: twilioNumber,
        to: formattedTo
      });
      console.log(`📱 [Twilio SMS] Sent to ${formattedTo}`);
      return true;
    } catch (err) {
      console.error(`📱❌ [Twilio SMS] Failed to send to ${formattedTo}:`, err.message);
      return false;
    }
  } else {
    // Mock SMS
    console.log('\n' + '='.repeat(50));
    console.log(`📱 [MOCK SMS] To: ${formattedTo}`);
    console.log(`💬 Message: ${body}`);
    console.log('='.repeat(50) + '\n');
    return true;
  }
};

module.exports = {
  sendSMS
};
