const path = require("path");
const fs = require("fs");
const { sendEmail } = require("./mailer");
const { validateOTPDetails } = require("./validation");

const LOGO_PATH = path.resolve(__dirname, "assets", "LOGO.png");

/**
 * Escapes unsafe characters for HTML interpolation.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Prepares the OTP verification email with plain text, HTML, and inline logo attachment.
 *
 * @param {Object} details
 * @param {string} details.name - Candidate name
 * @param {string} details.email - Candidate college email
 * @param {string} details.otp - Exactly 6-digit numeric OTP string
 * @returns {Object|null} Prepared email data object or null if input is invalid
 */
function prepareOTPEmail(details) {
    if (!details || typeof details !== "object") {
        return null;
    }

    const candidateName = (details.name || "Candidate").trim();
    const candidateEmail = (details.email || "").trim();
    const otp = typeof details.otp === "string" ? details.otp.trim() : String(details.otp || "").trim();

    const safeName = escapeHtml(candidateName);
    const safeOtp = escapeHtml(otp);

    const subject = "Verify your email | TAM Recruitment";

    const message = `Hello ${candidateName},

Use this verification code to complete your login to the TAM Recruitment Portal:

${otp}

If you didn't request this code, you can ignore this email.

Best regards,
Team TAM
Technical Association of [College Name]`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark light">
    <meta name="supported-color-schemes" content="dark light">
    <title>${subject}</title>
    <style>
        :root {
            color-scheme: dark light;
            supported-color-schemes: dark light;
        }
        body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
        }
        @media only screen and (max-width: 640px) {
            .wrapper-table {
                padding: 12px 6px !important;
            }
            .main-container {
                width: 100% !important;
                max-width: 100% !important;
                border-radius: 6px !important;
            }
            .content-padding {
                padding-left: 18px !important;
                padding-right: 18px !important;
            }
            .otp-code {
                font-size: 32px !important;
                letter-spacing: 6px !important;
            }
        }
    </style>
</head>

<body id="body" bgcolor="#0B1220" style="margin:0;padding:0;background-color:#0B1220;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B1220" class="wrapper-table" style="background-color:#0B1220;padding:24px 10px;">
<tr><td align="center" bgcolor="#0B1220" style="background-color:#0B1220;">

<!-- Main Card Container -->
<table width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#111C32" class="main-container" style="width:100%;max-width:560px;background-color:#111C32;border:1px solid #263B5A;border-top:3px solid #2563EB;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.35);">

    <!-- Header Section: Compact Logo & Motto -->
    <tr>
        <td align="center" bgcolor="#111C32" class="content-padding" style="padding:22px 20px 14px;background-color:#111C32;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#111C32" style="background-color:#111C32;margin:0 auto;">
                <tr>
                    <td align="center" bgcolor="#111C32" style="background-color:#111C32;">
                        <img src="cid:tam-club-logo@recruitment" alt="The AI &amp; ML Club Logo" width="100" height="96" style="display:block;margin:0 auto 6px;border:0;outline:none;text-decoration:none;max-width:100px;height:auto;" />
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;font-style:italic;color:#94A3B8;letter-spacing:0.3px;line-height:1.4;">
                            It's a place for everyone to learn
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Subtle Divider -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:0 24px;background-color:#111C32;">
            <div style="height:1px;background-color:#263B5A;line-height:1px;font-size:1px;">&nbsp;</div>
        </td>
    </tr>

    <!-- Body Content Section -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:24px 28px 20px;background-color:#111C32;">

            <!-- Main Heading -->
            <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;font-weight:700;color:#F1F5F9;letter-spacing:-0.3px;">
                Verify your email
            </h1>

            <!-- Greeting & Description -->
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.55;color:#F1F5F9;">
                Hello <strong>${safeName}</strong>,
            </p>
            <p style="margin:0 0 24px 0;font-size:14px;line-height:1.55;color:#94A3B8;">
                Use this verification code to complete your login to the TAM Recruitment Portal.
            </p>

            <!-- Prominent OTP Display Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B1220" style="background-color:#0B1220;border:1px solid #263B5A;border-radius:6px;margin:0 0 24px 0;">
                <tr>
                    <td align="center" style="padding:20px 16px;">
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#38BDF8;font-weight:600;margin-bottom:8px;">
                            Verification Code
                        </div>
                        <div class="otp-code" style="font-family:'Courier New',Courier,monospace,sans-serif;font-size:36px;font-weight:700;color:#F1F5F9;letter-spacing:8px;padding-left:8px;line-height:1.2;">
                            ${safeOtp}
                        </div>
                    </td>
                </tr>
            </table>

            <!-- Security Note -->
            <p style="margin:0;font-size:13px;line-height:1.5;color:#94A3B8;">
                If you didn't request this code, you can ignore this email.
            </p>

        </td>
    </tr>

    <!-- Footer Section -->
    <tr>
        <td bgcolor="#0B1220" class="content-padding" style="padding:18px 28px;background-color:#0B1220;border-top:1px solid #263B5A;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B1220" style="background-color:#0B1220;">
                <tr>
                    <td align="left" style="font-size:12px;line-height:1.5;color:#94A3B8;">
                        <strong style="color:#F1F5F9;">Team TAM</strong><br>
                        The AI & ML Club . VIT Vellore
                    </td>
                </tr>
            </table>
        </td>
    </tr>

</table>
</td></tr>
</table>

</body>
</html>
`.trim();

    const attachments = [];
    if (fs.existsSync(LOGO_PATH)) {
        attachments.push({
            filename: "LOGO.png",
            path: LOGO_PATH,
            cid: "tam-club-logo@recruitment",
            contentDisposition: "inline",
            contentType: "image/png"
        });
    }

    return {
        to: candidateEmail,
        subject,
        message,
        text: message,
        html,
        attachments
    };
}

/**
 * Validates, prepares, and immediately sends an OTP verification email to the candidate.
 *
 * @param {Object} details - OTP payload
 * @param {string} details.name - Candidate name
 * @param {string} details.email - Candidate college email
 * @param {string} details.otp - Exactly 6-digit numeric OTP string
 * @param {Object} [customTransporter] - Optional custom transporter (for testing/mocking)
 * @returns {Promise<{ success: boolean, recipient: string, messageId: string }>}
 */
async function sentOTP(details, customTransporter = null) {
    const validation = validateOTPDetails(details);
    if (!validation.isValid) {
        throw new Error(`Validation Error: ${validation.error}`);
    }

    const emailData = prepareOTPEmail(details);
    if (!emailData) {
        throw new Error("Unable to prepare OTP email: invalid candidate details.");
    }

    const info = await sendEmail(emailData, customTransporter);

    return {
        success: true,
        recipient: details.email.trim(),
        messageId: info?.messageId || "sent"
    };
}

module.exports = {
    prepareOTPEmail,
    sentOTP
};
