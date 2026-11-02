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
Technical Association of [College Name]`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>

    <link href="https://fonts.googleapis.com/css2?family=Anton&family=IM+Fell+English:ital@0;1&family=Old+Standard+TT:wght@400;700&family=UnifrakturMaguntia&display=swap" rel="stylesheet">
</head>

<body style="margin:0; padding:0; background-color:#211b17;">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
       bgcolor="#211b17" style="padding:28px 10px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0"
       bgcolor="#eee4c9"
       style="width:100%; max-width:600px; background-color:#eee4c9; color:#29231d;">

    <!-- Newspaper metadata -->
    <tr>
        <td style="padding:18px 25px 7px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="font-family:'Old Standard TT',Georgia,serif;
                               font-size:10px; letter-spacing:1.5px;
                               text-transform:uppercase; color:#514638;">
                        Volume I · Recruitment Edition
                    </td>
                    <td align="right"
                        style="font-family:'Old Standard TT',Georgia,serif;
                               font-size:10px; letter-spacing:1.5px;
                               text-transform:uppercase; color:#514638;">
                        The AI &amp; ML Club
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Masthead -->
    <tr>
        <td style="padding:0 25px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center"
                        style="border-top:2px solid #29231d;
                               border-bottom:1px solid #29231d;
                               padding:12px 0 10px;">

                        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px;">
                            <tr>
                                <td align="center">
                                    <img src="cid:tam-club-logo" alt="The AI &amp; ML Club Logo" width="56" height="54" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;max-width:56px;height:auto;" />
                                </td>
                            </tr>
                        </table>

                        <div style="font-family:'UnifrakturMaguntia',
                                    'Old English Text MT',Georgia,serif;
                                    font-size:52px; line-height:1.2;
                                    font-weight:400; color:#29231d;">
                            The TAM Times
                        </div>

                        <div style="font-family:'IM Fell English',Georgia,serif;
                                    font-size:12px; font-style:italic;
                                    color:#71634e; margin-top:2px;">
                            It's a place for everyone to learn
                        </div>

                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Edition strip -->
    <tr>
        <td style="padding:9px 25px 0;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #71634e;">
                <tr>
                    <td width="50%" align="center"
                        style="padding:7px 3px;
                               font-family:'Old Standard TT',Georgia,serif;
                               font-size:10px; font-weight:bold;
                               letter-spacing:0.12em;
                               color:#514638;
                               border-right:1px solid #71634e;">
                        CLUB RECRUITMENT
                    </td>
                    <td width="50%" align="center"
                        style="padding:7px 3px;
                               font-family:'Old Standard TT',Georgia,serif;
                               font-size:10px; font-weight:bold;
                               letter-spacing:0.12em;
                               color:#514638;">
                        OFFICIAL NOTICE
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Main headline -->
    <tr>
        <td align="center" style="padding:27px 25px 14px;">

            <div style="font-family:'Old Standard TT',Georgia,serif;
                        font-size:11px; font-weight:bold;
                        letter-spacing:0.12em;
                        color:#963d35; margin-bottom:12px;">
                SPECIAL RECRUITMENT DISPATCH
            </div>

            <div style="font-family:'Anton',Impact,sans-serif;
                        font-size:43px; font-weight:400;
                        letter-spacing:-0.01em;
                        line-height:1.08;
                        text-transform:uppercase;
                        color:#211c17;">
                YOUR INTERVIEW<br>
                IS CONFIRMED!
            </div>

            <div style="font-family:'IM Fell English',Georgia,serif;
                        font-size:14px; font-style:italic;
                        line-height:1.6; color:#75654e;
                        margin-top:12px;">
                An important announcement from the TAM Recruitment Desk.
            </div>

        </td>
    </tr>

    <!-- Heavy newspaper divider -->
    <tr>
        <td style="padding:0 25px;">
            <div style="border-top:2px solid #29231d;
                        border-bottom:1px solid #29231d;
                        height:3px;"></div>
        </td>
    </tr>

    <!-- Introduction -->
    <tr>
        <td style="padding:20px 30px 18px;
                   font-family:'IM Fell English',Georgia,serif;
                   font-size:15px; line-height:1.8; color:#30291f;">

            <p style="margin:0 0 12px;">
                Dear <strong>${safeName}</strong>,
            </p>

            <p style="margin:0; text-align:justify;">
                We are pleased to announce that your interview slot for
                the TAM recruitment drive has officially been confirmed.
                We look forward to meeting you and hearing your story.
            </p>

        </td>
    </tr>

    <!-- Interview bulletin heading -->
    <tr>
        <td style="padding:0 25px 10px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center"
                        style="border-top:1px solid #514638;
                               border-bottom:1px solid #514638;
                               padding:8px 0;
                               font-family:'Old Standard TT',Georgia,serif;
                               font-size:11px; font-weight:bold;
                               letter-spacing:0.12em;
                               color:#963d35;">
                        ✦ THE INTERVIEW BULLETIN ✦
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Interview details -->
    <tr>
        <td style="padding:0 25px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #514638;">

                <tr>
                    <td style="padding:18px;
                               border-bottom:1px solid #b5a585;">

                        <div style="font-family:'Old Standard TT',Georgia,serif;
                                    font-size:10px; font-weight:bold;
                                    letter-spacing:0.12em;
                                    color:#963d35;">
                            DATE &amp; TIME
                        </div>

                        <div style="font-family:'IM Fell English',Georgia,serif;
                                    font-size:20px; font-weight:bold;
                                    line-height:1.5; color:#29231d;
                                    margin-top:7px;">
                            ${safeTime}
                        </div>

                    </td>
                </tr>

                <tr>
                    <td style="padding:15px 18px;">

                        <div style="font-family:'Old Standard TT',Georgia,serif;
                                    font-size:10px; font-weight:bold;
                                    letter-spacing:0.12em;
                                    color:#963d35;">
                            MEETING ACCESS
                        </div>

                        <div style="font-family:'IM Fell English',Georgia,serif;
                                    font-size:14px; line-height:1.7;
                                    color:#514638; margin-top:6px;">
                            Your interview will take place online.
                            Use the official link below to join.
                        </div>

                    </td>
                </tr>

            </table>
        </td>
    </tr>

    <!-- Join button -->
    <tr>
        <td align="center" style="padding:0 25px 12px;">

            <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td bgcolor="#963d35" align="center"
                        style="border:1px solid #6e2c27;">

                        <a href="${safeLink}" target="_blank"
                           style="display:inline-block;
                                  padding:14px 32px;
                                  font-family:'Old Standard TT',Georgia,serif;
                                  font-size:13px; font-weight:bold;
                                  letter-spacing:0.12em;
                                  color:#fff0d7; text-decoration:none;">
                            JOIN INTERVIEW &nbsp; →
                        </a>

                    </td>
                </tr>
            </table>

            <p style="font-family:'IM Fell English',Georgia,serif;
                      font-size:12px; font-style:italic;
                      color:#75654e; margin:13px 0 6px;">
                Alternatively, access your meeting through this link:
            </p>

            <a href="${safeLink}" target="_blank"
               style="font-family:'Old Standard TT',Georgia,serif;
                      font-size:12px; color:#963d35;
                      word-break:break-all;">
                ${safeLink}
            </a>

        </td>
    </tr>

    <!-- Recruitment desk note -->
    <tr>
        <td style="padding:17px 25px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="border-top:1px solid #514638;
                               border-bottom:1px solid #514638;
                               padding:13px 5px;">

                        <div style="font-family:'Old Standard TT',Georgia,serif;
                                    font-size:11px; font-weight:bold;
                                    letter-spacing:0.12em;
                                    color:#963d35; margin-bottom:8px;">
                            FROM THE RECRUITMENT DESK
                        </div>

                        <div style="font-family:'IM Fell English',Georgia,serif;
                                    font-size:13px; line-height:1.8;
                                    color:#514638;">
                            Please join a few minutes before your scheduled
                            time and ensure your microphone, camera, and
                            internet connection are ready. For any queries,
                            simply reply to this email.
                        </div>

                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Signature -->
    <tr>
        <td style="padding:0 30px 23px;
                   font-family:'IM Fell English',Georgia,serif;
                   color:#30291f;">

            <div style="font-size:15px; line-height:1.7;">
                Yours sincerely,<br>
                <strong>The Recruitment Desk</strong>
            </div>

            <div style="font-size:12px; font-style:italic;
                        color:#75654e; margin-top:3px;">
                AI &amp; ML Club · VIT Vellore
            </div>

        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="padding:12px 25px;
                   background-color:#ded0ae;
                   border-top:2px solid #514638;">

            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="font-family:'Old Standard TT',Georgia,serif;
                               font-size:10px; font-weight:bold;
                               letter-spacing:0.12em;
                               color:#514638;">
                        THE TAM TIMES
                    </td>

                    <td align="right"
                        style="font-family:'Old Standard TT',Georgia,serif;
                               font-size:10px; letter-spacing:0.12em;
                               color:#514638;">
                        RECRUITMENT DESK
                    </td>
                </tr>
            </table>

        </td>
    </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`.trim();

    const attachments = [];
    if (fs.existsSync(LOGO_PATH)) {
        attachments.push({
            filename: "LOGO.png",
            path: LOGO_PATH,
            cid: "tam-club-logo"
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
