/**
 * Recruitment Portal - Interview Confirmation Emailer
 * Validation module for interview confirmation details.
 */

/**
 * College Email format: firstName.SurnameYear@vitstudent.ac.in
 * - First name: alphabetic characters
 * - Period ('.') separator
 * - Surname: alphabetic characters followed by 4-digit graduation/admission year
 * - Domain: @vitstudent.ac.in (case-insensitive)
 *
 * Examples:
 * - jhon.doe2023@vitstudent.ac.in
 */
const COLLEGE_EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+[0-9]{4}@vitstudent\.ac\.in$/i;

/**
 * Validates a college email string against the official VIT student email pattern.
 * @param {any} email
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateCollegeEmail(email) {
    if (typeof email !== "string") {
        return {
            isValid: false,
            error: "Field 'email' is required and must be a valid college email address (firstName.SurnameYear@vitstudent.ac.in)."
        };
    }

    const trimmed = email.trim();
    if (!COLLEGE_EMAIL_REGEX.test(trimmed)) {
        return {
            isValid: false,
            error: "Field 'email' must follow the college email format: firstName.SurnameYear@vitstudent.ac.in"
        };
    }

    return {
        isValid: true
    };
}

/**
 * Helper to check if an email string is a valid college email.
 * @param {any} email
 * @returns {boolean}
 */
function isValidCollegeEmail(email) {
    return typeof email === "string" && COLLEGE_EMAIL_REGEX.test(email.trim());
}

/**
 * Validates candidate and interview details before sending confirmation email.
 *
 * Required fields:
 * - name: non-empty string
 * - email: valid college email address format (firstName.SurnameYear@vitstudent.ac.in)
 * - time: valid date, timestamp, or parseable ISO date string
 * - meetingLink: valid HTTP or HTTPS URL
 *
 * @param {any} details
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateInterviewDetails(details) {
    if (!details || typeof details !== "object" || Array.isArray(details)) {
        return {
            isValid: false,
            error: "Interview details must be a non-null object."
        };
    }

    // 1. Name validation
    if (typeof details.name !== "string" || details.name.trim() === "") {
        return {
            isValid: false,
            error: "Field 'name' is required and must be a non-empty string."
        };
    }

    // 2. Email validation
    const emailValidation = validateCollegeEmail(details.email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }

    // 3. Time validation
    if (details.time === undefined || details.time === null || details.time === "") {
        return {
            isValid: false,
            error: "Field 'time' is required and must be a valid date or timestamp."
        };
    }

    const parsedDate = new Date(details.time);
    if (isNaN(parsedDate.getTime())) {
        return {
            isValid: false,
            error: "Field 'time' must be a valid date, ISO timestamp, or date string."
        };
    }

    // 4. Meeting link validation
    if (typeof details.meetingLink !== "string" || details.meetingLink.trim() === "") {
        return {
            isValid: false,
            error: "Field 'meetingLink' is required and must be a valid HTTP or HTTPS URL."
        };
    }

    const trimmedUrl = details.meetingLink.trim();
    try {
        const parsedUrl = new URL(trimmedUrl);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return {
                isValid: false,
                error: "Field 'meetingLink' must use HTTP or HTTPS protocol."
            };
        }
    } catch {
        return {
            isValid: false,
            error: "Field 'meetingLink' must be a valid URL (e.g. https://meet.google.com/xyz)."
        };
    }

    return {
        isValid: true
    };
}

/**
 * Boolean validation helper.
 * @param {any} details
 * @returns {boolean}
 */
function isValidInterviewDetails(details) {
    return validateInterviewDetails(details).isValid;
}

/**
 * Exactly 6 numeric digits (000000 to 999999).
 */
const OTP_REGEX = /^\d{6}$/;

/**
 * Validates candidate details and OTP code before sending verification email.
 *
 * Required fields:
 * - name: non-empty string
 * - email: valid college email address format (firstName.SurnameYear@vitstudent.ac.in)
 * - otp: string of exactly 6 numeric digits (e.g. "004821")
 *
 * @param {any} details
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateOTPDetails(details) {
    if (!details || typeof details !== "object" || Array.isArray(details)) {
        return {
            isValid: false,
            error: "OTP details must be a non-null object."
        };
    }

    // 1. Name validation
    if (typeof details.name !== "string" || details.name.trim() === "") {
        return {
            isValid: false,
            error: "Field 'name' is required and must be a non-empty string."
        };
    }

    // 2. Email validation
    const emailValidation = validateCollegeEmail(details.email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }

    // 3. OTP validation
    // Treat OTP strictly as a string, never convert to number, preserve leading zeros.
    if (typeof details.otp !== "string") {
        return {
            isValid: false,
            error: "Field 'otp' is required and must be a string containing exactly 6 numeric digits."
        };
    }

    const trimmedOtp = details.otp.trim();
    if (!OTP_REGEX.test(trimmedOtp)) {
        return {
            isValid: false,
            error: "Field 'otp' must contain exactly 6 numeric digits (000000 to 999999) with no spaces or special characters."
        };
    }

    return {
        isValid: true
    };
}

/**
 * Boolean validation helper for OTP details.
 * @param {any} details
 * @returns {boolean}
 */
function isValidOTPDetails(details) {
    return validateOTPDetails(details).isValid;
}

module.exports = {
    COLLEGE_EMAIL_REGEX,
    OTP_REGEX,
    validateCollegeEmail,
    isValidCollegeEmail,
    validateInterviewDetails,
    isValidInterviewDetails,
    validateOTPDetails,
    isValidOTPDetails
};

