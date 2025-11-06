import axios from 'axios';

/**
 * Verify reCAPTCHA token
 * @param {string} token - reCAPTCHA token from frontend
 * @param {string} secretKey - reCAPTCHA secret key
 * @returns {Promise<Object>} Verification result
 */
export const verifyRecaptcha = async (token, secretKey) => {
  if (!token || !secretKey) {
    return { success: false, error: 'Missing reCAPTCHA token or secret key' };
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      },
      {
        timeout: 5000, // 5 second timeout
      }
    );

    const { success, score, action, challenge_ts, hostname, 'error-codes': errorCodes } = response.data;

    // For reCAPTCHA v3, also check score (0.0 to 1.0, higher is better)
    // Typically, scores above 0.5 are considered legitimate
    if (success && score !== undefined) {
      return {
        success: success && score >= 0.5,
        score,
        action,
        challenge_ts,
        hostname,
        errorCodes: success && score >= 0.5 ? null : errorCodes || ['Low score'],
      };
    }

    return {
      success,
      score,
      action,
      challenge_ts,
      hostname,
      errorCodes: success ? null : errorCodes,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return {
      success: false,
      error: 'Failed to verify reCAPTCHA',
      errorCodes: ['network_error'],
    };
  }
};

