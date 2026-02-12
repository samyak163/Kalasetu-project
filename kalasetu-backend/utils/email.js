import { Resend } from 'resend';
import { EMAIL_CONFIG } from '../config/env.config.js';

let resendClient = null;

/**
 * Initialize Resend client
 * @returns {Resend|null} Resend client or null
 */
export const initResend = () => {
  if (!EMAIL_CONFIG.enabled || EMAIL_CONFIG.provider !== 'resend') {
    console.log('⚠️ Resend email service is disabled');
    return null;
  }

  if (!EMAIL_CONFIG.resend.apiKey) {
    console.warn('Resend API key is not configured');
    return null;
  }

  try {
    resendClient = new Resend(EMAIL_CONFIG.resend.apiKey);
    console.log('✅ Resend client initialized');
    return resendClient;
  } catch (error) {
    console.error('❌ Failed to initialize Resend:', error.message);
    return null;
  }
};

/**
 * Get Resend client instance
 * @returns {Resend|null}
 */
export const getResendClient = () => {
  if (!resendClient) {
    return initResend();
  }
  return resendClient;
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object|null>} Email response
 */
export const sendEmail = async (options) => {
  const client = getResendClient();
  if (!client) {
    console.log('📧 Email would be sent:', options);
    return null;
  }

  try {
    const { to, subject, html, text, replyTo } = options;

    const response = await client.emails.send({
      from: `${EMAIL_CONFIG.resend.fromName} <${EMAIL_CONFIG.resend.fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text,
      text,
      reply_to: replyTo,
    });

    console.log(`✅ Email sent to ${to}: ${subject}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return null;
  }
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @returns {Promise<Object|null>} Email response
 */
export const sendWelcomeEmail = async (to, name) => {
  // Log welcome email info only in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n📧 ===== WELCOME EMAIL =====');
    console.log(`👤 To: ${to} (${name})`);
    console.log(`✅ Account created successfully!`);
    console.log('===========================\n');
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to KalaSetu</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Welcome to KalaSetu!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          <p>We're excited to have you join the KalaSetu community - where traditional artisans connect with customers who appreciate authentic craftsmanship.</p>
          
          <h3>What's next?</h3>
          <ul>
            <li>Complete your profile to showcase your skills</li>
            <li>Upload your portfolio to attract customers</li>
            <li>Start connecting with potential clients</li>
            <li>Explore other artisans in the community</li>
          </ul>

          <a href="${EMAIL_CONFIG.appUrl}/dashboard" class="button">Go to Dashboard</a>

          <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
          <p>Connecting artisans with the world.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
  subject: 'Welcome to KalaSetu - Let\'s Get Started! 🎨',
    html,
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object|null>} Email response
 */
export const sendPasswordResetEmail = async (to, name, resetToken) => {
  const resetUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We received a request to reset your password for your KalaSetu account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0 0 0;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>

          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Password - KalaSetu',
    html,
  });
};

/**
 * Send OTP code via email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} purpose - Purpose of OTP (registration, login, etc.)
 * @returns {Promise<Object|null>} Email response
 */
export const sendOTPEmail = async (to, name, otpCode, purpose = 'verification') => {
  const purposeText = purpose === 'registration' ? 'registration' : 
                     purpose === 'login' ? 'login' : 'verification';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #667eea; background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Verification Code</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Your verification code for ${purposeText} is:</p>
          
          <div class="otp-code">${otpCode}</div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0 0 0;">
              <li>This code will expire in 10 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>

          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Enter this code in the verification form to complete your ${purposeText}.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Your KalaSetu Verification Code - ${otpCode}`,
    html,
  });
};

/**
 * Send email verification
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} verificationToken - Verification token
 * @returns {Promise<Object|null>} Email response
 */
export const sendVerificationEmail = async (to, name, verificationToken) => {
  const verifyUrl = `${EMAIL_CONFIG.appUrl}/verify-email?token=${verificationToken}`;

  // Log verification link only in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n📧 ===== EMAIL VERIFICATION LINK =====');
    console.log(`👤 To: ${to}`);
    console.log(`🔗 Verification URL: ${verifyUrl}`);
    console.log('=====================================\n');
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for registering with KalaSetu. Please verify your email address to complete your registration.</p>
          
          <a href="${verifyUrl}" class="button">Verify Email Address</a>

          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
          </p>

          <p style="margin-top: 20px;">This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Verify Your Email - KalaSetu',
    html,
  });
};

/**
 * Send order confirmation email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {Object} orderDetails - Order details
 * @returns {Promise<Object|null>} Email response
 */
export const sendOrderConfirmationEmail = async (to, name, orderDetails) => {
  const { orderId, items, total, orderUrl } = orderDetails;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-box { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .item:last-child { border-bottom: none; }
        .total { font-size: 20px; font-weight: bold; margin-top: 20px; text-align: right; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Thank you, ${name}!</h2>
          <p>Your order has been confirmed and is being processed.</p>
          
          <div class="order-box">
            <h3>Order #${orderId}</h3>
            ${items.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}
              </div>
            `).join('')}
             <div class="total">
               Total: ₹${total.toLocaleString('en-IN')}
             </div>
          </div>

          <a href="${orderUrl}" class="button">Track Your Order</a>

          <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmation - #${orderId}`,
    html,
  });
};

/**
 * Send notification email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {Object} notification - Notification details
 * @returns {Promise<Object|null>} Email response
 */
export const sendNotificationEmail = async (to, name, notification) => {
  const { title, message, actionUrl, actionText } = notification;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>${message}</p>
          
          ${actionUrl && actionText ? `
            <a href="${actionUrl}" class="button">${actionText}</a>
          ` : ''}

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            You're receiving this email because you're a valued member of KalaSetu.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
          <p><a href="${EMAIL_CONFIG.appUrl}/settings/notifications" style="color: #667eea;">Manage Notification Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: title,
    html,
  });
};

/**
 * Send batch emails
 * @param {Array} emails - Array of email objects
 * @returns {Promise<Array>} Results array
 */
export const sendBatchEmails = async (emails) => {
  const client = getResendClient();
  if (!client) {
    console.log('📧 Batch emails would be sent:', emails.length);
    return [];
  }

  try {
    const results = await Promise.allSettled(
      emails.map(email => sendEmail(email))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Sent ${successful} emails, ${failed} failed`);
    return results;
  } catch (error) {
    console.error('❌ Failed to send batch emails:', error.message);
    return [];
  }
};

/**
 * Send contact form submission
 * @param {Object} data - Contact form data
 * @returns {Promise<Object|null>} Email response
 */
export const sendContactFormEmail = async (data) => {
  const { name, email, subject, message } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📬 New Contact Form Submission</h2>
        
        <div class="field">
          <div class="label">From:</div>
          <div class="value">${name} (${email})</div>
        </div>

        <div class="field">
          <div class="label">Subject:</div>
          <div class="value">${subject}</div>
        </div>

        <div class="field">
          <div class="label">Message:</div>
          <div class="value">${message.replaceAll('\n', '<br>')}</div>
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Sent from KalaSetu Contact Form
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: EMAIL_CONFIG.resend.fromEmail,
    subject: `Contact Form: ${subject}`,
    html,
    replyTo: email,
  });
};

/**
 * Send ticket response email
 * @param {string} to - Recipient email
 * @param {string} userName - Recipient name
 * @param {Object} ticket - Support ticket object
 * @param {string} message - Admin response message
 * @returns {Promise<Object|null>} Email response
 */
export const sendTicketResponseEmail = async (to, userName, ticket, message) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Ticket Response - KalaSetu</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #A55233; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; }
        .ticket-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .response-box { background: #fff7ed; border-left: 4px solid #A55233; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #A55233; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Support Ticket Response</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Our support team has responded to your ticket.</p>

          <div class="ticket-info">
            <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
          </div>

          <div class="response-box">
            <h3>Admin Response:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>

          <a href="${EMAIL_CONFIG.appUrl}/support/tickets/${ticket._id}" class="button">View Ticket</a>

          <p style="margin-top: 30px;">You can reply to this ticket by logging into your account and adding a message.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
          <p>Connecting artisans with the world.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Support Ticket Response - ${ticket.ticketNumber}`,
    html,
  });
};

/**
 * Send ticket status change email
 * @param {string} to - Recipient email
 * @param {string} userName - Recipient name
 * @param {Object} ticket - Support ticket object
 * @param {string} newStatus - New ticket status
 * @returns {Promise<Object|null>} Email response
 */
export const sendTicketStatusEmail = async (to, userName, ticket, newStatus) => {
  const statusColors = {
    resolved: '#4caf50',
    closed: '#666',
    open: '#2196f3',
    in_progress: '#ff9800'
  };

  const statusMessages = {
    resolved: 'Your ticket has been resolved. We hope your issue was addressed satisfactorily.',
    closed: 'Your ticket has been closed. If you need further assistance, please create a new ticket.',
    open: 'Your ticket status has been updated to open.',
    in_progress: 'Your ticket is now being actively worked on by our support team.'
  };

  const headerColor = statusColors[newStatus] || '#A55233';
  const statusMessage = statusMessages[newStatus] || `Your ticket status has been updated to ${newStatus}.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Ticket ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - KalaSetu</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${headerColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; }
        .ticket-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .status-badge { display: inline-block; padding: 8px 15px; background: ${headerColor}; color: white; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
        .button { display: inline-block; padding: 12px 30px; background: #A55233; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ticket Status Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>${statusMessage}</p>

          <div class="ticket-info">
            <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>New Status:</strong> <span class="status-badge">${newStatus}</span></p>
          </div>

          <a href="${EMAIL_CONFIG.appUrl}/support/tickets/${ticket._id}" class="button">View Ticket</a>

          ${newStatus === 'resolved' || newStatus === 'closed' ?
            '<p style="margin-top: 30px;">If you need further assistance, feel free to create a new support ticket.</p>' :
            '<p style="margin-top: 30px;">You can continue the conversation by adding messages to this ticket.</p>'}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
          <p>Connecting artisans with the world.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Support Ticket ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - ${ticket.ticketNumber}`,
    html,
  });
};

export default {
  initResend,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendNotificationEmail,
  sendBatchEmails,
  sendContactFormEmail,
  sendTicketResponseEmail,
  sendTicketStatusEmail,
};
