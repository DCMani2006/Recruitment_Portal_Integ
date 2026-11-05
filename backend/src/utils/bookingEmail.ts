import { prepareConfirmationEmail, formatInterviewTime } from "../emailer";
import { prisma } from "../prisma";
import { sendMail } from "./mailer";

const isWebLink = (s: string | null): s is string => {
  try {
    return !!s && /^https?:$/.test(new URL(s).protocol);
  } catch {
    return false;
  }
};

// Emails the candidate their interview time after they book a slot. Uses the emailer's
// "Interview Confirmation" email when the slot has a meeting link; otherwise a short note that the
// link will follow. Never throws: a failed email must not undo or block the booking.
// Each real attempt is recorded in EmailLog (type MEETING_LINK) so admins can see it.
export async function sendBookingConfirmation(
  applicationId: string,
  student: { name: string; email: string },
  slot: { startTime: Date; meetingLink: string | null }
) {
  try {
    let sent: boolean;
    if (isWebLink(slot.meetingLink)) {
      const email = prepareConfirmationEmail({
        name: student.name,
        email: student.email,
        time: slot.startTime,
        meetingLink: slot.meetingLink,
      });
      if (!email) throw new Error("Couldn't prepare the confirmation email");
      sent = await sendMail(student.email, email.subject, email.text, email.html);
    } else {
      const when = formatInterviewTime(slot.startTime);
      sent = await sendMail(
        student.email,
        "Interview Confirmation – Club Recruitment",
        `Dear ${student.name},\n\nYour interview slot is confirmed for ${when}.\n\n` +
          "The meeting link will be shared before your interview. You'll also see it on the recruitment " +
          "portal once it's added.\n\nBest regards,\nThe Recruitment Team"
      );
    }
    if (sent) {
      await prisma.emailLog.create({
        data: { applicationId, type: "MEETING_LINK", status: "SENT", attempts: 1, sentAt: new Date() },
      });
    }
  } catch (e) {
    console.error("Booking confirmation email failed", e);
    await prisma.emailLog
      .create({
        data: {
          applicationId,
          type: "MEETING_LINK",
          status: "FAILED",
          attempts: 1,
          error: String((e as Error)?.message ?? e).slice(0, 500),
        },
      })
      .catch(() => {});
  }
}
