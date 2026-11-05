import { sendEmail, prepareOTPEmail } from "../emailer";
import { HttpError } from "../errors";

// Uses the shared emailer module (src/emailer), so there is one set of email settings:
// EMAIL_USER, EMAIL_APP_PASSWORD and optionally EMAIL_FROM
const configured = !!process.env.EMAIL_USER && !!process.env.EMAIL_APP_PASSWORD;

// Returns true when the email was really sent, false when it was only printed (development, no email settings)
// attachments: e.g. the inline club logo the designed emails reference as cid:...
export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: unknown[]
): Promise<boolean> {
  if (!configured) {
    // development only: print the email instead of sending it
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[DEV EMAIL] to: ${to}\n${subject}\n${text}\n`);
      return false;
    }
    throw new HttpError(503, "Email service is not configured", "EMAIL_NOT_CONFIGURED");
  }
  try {
    await sendEmail({ to, subject, text, ...(html ? { html } : {}), ...(attachments?.length ? { attachments } : {}) });
    return true;
  } catch (e) {
    console.error("Email failed", e);
    throw new HttpError(502, "Couldn't send the email. Please try again.", "EMAIL_FAILED");
  }
}

// Sign-up / password-reset code, in the emailer's designed "verification code" email.
// At sign-up the student's name isn't known yet, so the greeting is "Hello there".
export function sendCodeEmail(to: string, otp: string, purpose: "signup" | "reset", name?: string | null) {
  const email = prepareOTPEmail({ name: name?.trim() || "there", email: to, otp, purpose });
  if (!email) throw new HttpError(500, "Couldn't prepare the email", "EMAIL_FAILED");
  return sendMail(to, email.subject, email.text, email.html, email.attachments);
}
