const path = require("path");
const fs = require("fs");
const { sendEmail } = require("./mailer");
const { validateInterviewDetails } = require("./validation");

const LOGO_PATH = path.resolve(__dirname, "assets", "LOGO.png");

/**
 * Formats an interview date/time string or Date object.
 *
 * Timezone Handling:
 * 1. Explicit timezone offsets in ISO strings (e.g., "+05:30", "-04:00", "Z")
 *    are respected and preserved directly.
 * 2. If no timezone is specified in the input string, or a native Date object is provided,
 *    the date is formatted according to the project convention:
 *    Indian Standard Time (IST / Asia/Kolkata, UTC+05:30).
 *
 * @param {string|Date|number} timeInput - Date/time to format
 * @returns {string} Formatted human-readable date and time string
 */
function formatInterviewTime(timeInput) {
    if (!timeInput) return "";

    // 1. If string with explicit ISO-style offset (e.g. 2026-10-25T15:00:00+05:30 or Z)
    if (typeof timeInput === "string") {
        const isoMatch = timeInput.match(
            /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:(Z)|([+-]\d{2}):?(\d{2}))?$/i
        );

        if (isoMatch) {
            const [, year, month, day, hour, minute, , isUtc, offsetHour, offsetMin] = isoMatch;
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const mIdx = parseInt(month, 10) - 1;
            const monthName = monthNames[mIdx] || month;

            let h = parseInt(hour, 10);
            const m = minute;
            const ampm = h >= 12 ? "PM" : "AM";
            h = h % 12 || 12;
            const formattedTime = `${h}:${m} ${ampm}`;

            let tzLabel = "";
            if (isUtc) {
                tzLabel = " (UTC)";
            } else if (offsetHour !== undefined) {
                const tzSign = offsetHour.startsWith("-") ? "-" : "+";
                const cleanHour = offsetHour.replace(/^[+-]/, "");
                const tzStr = `UTC${tzSign}${cleanHour}:${offsetMin}`;
                tzLabel = (tzStr === "UTC+05:30") ? " (IST)" : ` (${tzStr})`;
            } else {
                // Default project convention timezone: IST
                tzLabel = " (IST)";
            }

            // Determine day of the week
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const localDate = new Date(Date.UTC(parseInt(year, 10), mIdx, parseInt(day, 10)));
            const dayOfWeek = isNaN(localDate.getTime()) ? "" : `${dayNames[localDate.getUTCDay()]}, `;

            return `${dayOfWeek}${monthName} ${parseInt(day, 10)}, ${year} at ${formattedTime}${tzLabel}`;
        }
    }

    // 2. Native Date objects or other parseable date strings
    const date = new Date(timeInput);
    if (isNaN(date.getTime())) {
        return String(timeInput);
    }

    try {
        const formatter = new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
            timeZoneName: "short"
        });
        return formatter.format(date);
    } catch {
        return date.toLocaleString();
    }
}

/**
 * Prepares the interview confirmation email content (subject, text body, and HTML body).
 *
 * @param {Object} details
 * @param {string} details.name - Candidate name
 * @param {string} details.email - Candidate email
 * @param {string|Date} details.time - Interview date and time
 * @param {string} details.meetingLink - Video meeting URL
 * @returns {Object|null} Email options object or null if invalid
 */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function prepareConfirmationEmail(details) {
    if (!details || typeof details !== "object") {
        return null;
    }

    const candidateName = (details.name || "Candidate").trim();
    const candidateEmail = (details.email || "").trim();
    const meetingLink = (details.meetingLink || "").trim();
    const formattedTime = formatInterviewTime(details.time);

    const safeName = escapeHtml(candidateName);
    const safeTime = escapeHtml(formattedTime);
    const safeLink = escapeHtml(meetingLink);

    const subject = "Interview Confirmed | TAM Recruitment";

    const message = `Dear ${candidateName},

Your interview slot for the TAM recruitment drive has been successfully confirmed!

INTERVIEW DETAILS
Date & Time: ${formattedTime}
Meeting Link: ${meetingLink}

Please join the meeting using the link above at your scheduled time. We recommend joining a few minutes early and checking your audio, video, and internet connection.

If you have any questions, feel free to reply to this email.

Best regards,
Team TAM
The AI & ML Club, VIT Vellore`;

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
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        u + #body a {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
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
                padding-left: 16px !important;
                padding-right: 16px !important;
            }
            .headline-text {
                font-size: 24px !important;
                line-height: 1.25 !important;
            }
            .action-btn {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
                text-align: center !important;
            }
            .sub-card {
                padding: 12px 14px !important;
            }
        }
    </style>
</head>

<body id="body" bgcolor="#0B1220" style="margin:0;padding:0;background-color:#0B1220;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B1220" class="wrapper-table" style="background-color:#0B1220;padding:24px 10px;">
<tr><td align="center" bgcolor="#0B1220" style="background-color:#0B1220;">

<!-- Main Card Container -->
<table width="610" cellpadding="0" cellspacing="0" border="0" bgcolor="#111C32" class="main-container" style="width:100%;max-width:610px;background-color:#111C32;border:1px solid #263B5A;border-top:3px solid #2563EB;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.35);">

    <!-- Header Section: Logo & Motto (Primary Visual Identity, no metadata or category bars) -->
    <tr>
        <td align="center" bgcolor="#111C32" class="content-padding" style="padding:24px 20px 16px;background-color:#111C32;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#111C32" style="background-color:#111C32;margin:0 auto;">
                <tr>
                    <td align="center" bgcolor="#111C32" style="background-color:#111C32;">
                        <img src="cid:tam-club-logo@recruitment" alt="The AI &amp; ML Club Logo" width="120" height="116" style="display:block;margin:0 auto 8px;border:0;outline:none;text-decoration:none;max-width:120px;height:auto;" />
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-style:italic;color:#94A3B8;letter-spacing:0.3px;line-height:1.4;">
                            It's a place for everyone to learn
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Subtle Divider -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:0 20px;background-color:#111C32;">
            <div style="height:1px;background-color:#263B5A;line-height:1px;font-size:1px;">&nbsp;</div>
        </td>
    </tr>

    <!-- Prominent Headline Block -->
    <tr>
        <td align="center" bgcolor="#111C32" class="content-padding" style="padding:20px 20px 14px;background-color:#111C32;">
            <div class="headline-text" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.3px;line-height:1.2;text-transform:uppercase;color:#F1F5F9;">
                YOUR INTERVIEW<br>IS CONFIRMED!
            </div>

            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:#94A3B8;letter-spacing:0.2px;line-height:1.45;margin-top:8px;">
                An important announcement from the Team TAM.
            </div>
        </td>
    </tr>

    <!-- Subtle Divider -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:0 20px;background-color:#111C32;">
            <div style="height:1px;background-color:#263B5A;line-height:1px;font-size:1px;">&nbsp;</div>
        </td>
    </tr>

    <!-- Candidate Greeting & Confirmation Message (Left-Aligned) -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:18px 22px 14px;text-align:left;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.65;color:#CBD5E1;background-color:#111C32;">
            <p style="margin:0 0 10px;text-align:left;color:#CBD5E1;font-size:14px;line-height:1.65;">
                Dear <strong style="color:#F1F5F9;font-weight:700;">${safeName}</strong>,
            </p>

            <p style="margin:0;text-align:left;color:#CBD5E1;font-size:14px;line-height:1.65;">
                We are pleased to announce that your interview slot for
                the TAM recruitment drive has officially been confirmed.
                We look forward to meeting you and hearing your story.
            </p>
        </td>
    </tr>

    <!-- Interview Bulletin Section Heading -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:4px 20px 8px;background-color:#111C32;">
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#38BDF8;text-transform:uppercase;">
                ✦ THE INTERVIEW BULLETIN ✦
            </div>
        </td>
    </tr>

    <!-- Interview Details Card (Prominent Date & Time + Meeting Access) -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:0 20px 16px;background-color:#111C32;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E1726" class="sub-card" style="border:1px solid #263B5A;border-left:3px solid #2563EB;border-radius:6px;background-color:#0E1726;overflow:hidden;">
                <!-- Date & Time -->
                <tr>
                    <td bgcolor="#0E1726" style="padding:14px 16px;background-color:#0E1726;border-bottom:1px solid #263B5A;text-align:left;">
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.2px;color:#38BDF8;text-transform:uppercase;">
                            DATE &amp; TIME
                        </div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:17px;font-weight:700;line-height:1.4;color:#F1F5F9;margin-top:4px;">
                            ${safeTime}
                        </div>
                    </td>
                </tr>
                <!-- Meeting Access -->
                <tr>
                    <td bgcolor="#0E1726" style="padding:12px 16px;background-color:#0E1726;text-align:left;">
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.2px;color:#38BDF8;text-transform:uppercase;">
                            MEETING ACCESS
                        </div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:1.55;color:#94A3B8;margin-top:4px;">
                            Your interview will take place online.
                            Use the official link below to join.
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- JOIN INTERVIEW Action Button -->
    <tr>
        <td align="center" bgcolor="#111C32" class="content-padding" style="padding:4px 20px 16px;background-color:#111C32;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#2563EB" style="margin:0 auto;background-color:#2563EB;border-radius:6px;">
                <tr>
                    <td bgcolor="#2563EB" align="center" style="background-color:#2563EB;border-radius:6px;">
                        <a href="${safeLink}" target="_blank" class="action-btn"
                           style="display:inline-block;padding:13px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.8px;color:#F1F5F9;text-decoration:none;background-color:#2563EB;border-radius:6px;min-height:20px;">
                            JOIN INTERVIEW &nbsp; →
                        </a>
                    </td>
                </tr>
            </table>

            <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#94A3B8;margin:12px 0 4px;">
                Alternatively, access your meeting through this link:
            </p>

            <a href="${safeLink}" target="_blank"
               style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11.5px;color:#38BDF8;word-break:break-all;text-decoration:underline;">
                ${safeLink}
            </a>
        </td>
    </tr>

    <!-- Team TAM Instructions Card -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:4px 20px 16px;background-color:#111C32;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E1726" class="sub-card" style="border:1px solid #263B5A;border-radius:6px;background-color:#0E1726;">
                <tr>
                    <td bgcolor="#16233B" style="padding:7px 14px;background-color:#16233B;border-bottom:1px solid #263B5A;text-align:left;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;color:#38BDF8;text-transform:uppercase;">
                        FROM THE TEAM TAM
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#0E1726" style="padding:12px 16px;text-align:left;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12.5px;line-height:1.6;color:#94A3B8;background-color:#0E1726;">
                        Please join a few minutes before your scheduled
                        time and ensure your microphone, camera, and
                        internet connection are ready. For any queries,
                        simply contact us on WhatsApp.
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Closing & Signature -->
    <tr>
        <td bgcolor="#111C32" class="content-padding" style="padding:0 22px 18px;text-align:left;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#CBD5E1;background-color:#111C32;">
            <div style="font-size:14px;line-height:1.5;color:#CBD5E1;">
                Yours sincerely,<br>
                <strong style="color:#F1F5F9;font-weight:700;">The Team TAM</strong>
            </div>

            <div style="font-size:11px;font-weight:600;letter-spacing:0.5px;color:#38BDF8;margin-top:4px;">
                The AI &amp; ML Club · VIT Vellore
            </div>
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
        formattedTime,
        meetingLink,
        attachments
    };
}

/**
 * Validates, prepares, and immediately sends an interview confirmation email.
 *
 * @param {Object} details - Interview confirmation payload
 * @param {string} details.name - Candidate name
 * @param {string} details.email - Candidate email
 * @param {string|Date} details.time - Interview time
 * @param {string} details.meetingLink - Meeting URL
 * @param {Object} [customTransporter] - Optional custom transporter (for testing/mocking)
 * @returns {Promise<{ success: boolean, recipient: string, messageId: string }>}
 */
async function sendInterviewConfirmation(details, customTransporter = null) {
    const validation = validateInterviewDetails(details);
    if (!validation.isValid) {
        throw new Error(`Validation Error: ${validation.error}`);
    }

    const emailData = prepareConfirmationEmail(details);
    if (!emailData) {
        throw new Error("Unable to prepare email: invalid candidate details.");
    }

    const info = await sendEmail(emailData, customTransporter);

    return {
        success: true,
        recipient: details.email.trim(),
        messageId: info?.messageId || "sent"
    };
}

module.exports = {
    formatInterviewTime,
    prepareConfirmationEmail,
    sendInterviewConfirmation
};
