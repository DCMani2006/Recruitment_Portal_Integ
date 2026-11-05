/**
 * Recruitment Portal - Interview Confirmation Emailer Module
 * Public interface for sending interview confirmation emails after candidate slot confirmation.
 *
 * Usage:
 * ```javascript
 * const { sendInterviewConfirmation } = require("./emailer");
 *
 * await sendInterviewConfirmation({
 *   name: "Candidate Name",
 *   email: "candidate@example.com",
 *   time: "2026-10-25T15:00:00+05:30",
 *   meetingLink: "https://meet.google.com/abc-defg-hij"
 * });
 * ```
 */

const {
    sendInterviewConfirmation,
    prepareConfirmationEmail,
    formatInterviewTime
} = require("./emailService");

const {
    sentOTP,
    prepareOTPEmail
} = require("./OTPEmailer");

const {
    validateInterviewDetails,
    isValidInterviewDetails,
    validateCollegeEmail,
    isValidCollegeEmail,
    validateOTPDetails,
    isValidOTPDetails,
    COLLEGE_EMAIL_REGEX,
    OTP_REGEX
} = require("./validation");

const {
    sendEmail,
    setTransporter,
    getTransporter,
    resetTransporter
} = require("./mailer");

module.exports = {
    // Primary API
    sendInterviewConfirmation,
    sentOTP,

    // Template and formatting utilities
    prepareConfirmationEmail,
    prepareOTPEmail,
    formatInterviewTime,

    // Validation utilities
    validateInterviewDetails,
    isValidInterviewDetails,
    validateOTPDetails,
    isValidOTPDetails,
    validateCollegeEmail,
    isValidCollegeEmail,
    COLLEGE_EMAIL_REGEX,
    OTP_REGEX,

    // Low-level mailer & transporter helpers (useful for mocking and testing)
    sendEmail,
    setTransporter,
    getTransporter,
    resetTransporter
};
