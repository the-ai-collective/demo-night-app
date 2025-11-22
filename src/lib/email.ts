import { Resend } from "resend";

import { PostEventDigestEmail } from "~/emails/PostEventDigest";
import { StatusUpdateEmail } from "~/emails/StatusUpdate";
import { SubmissionConfirmationEmail } from "~/emails/SubmissionConfirmation";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = "Demo Night <noreply@divvsaxena.com>";

interface SubmissionEmailData {
  eventName: string;
  demoName: string;
  pocName: string;
  email: string;
}

export async function sendSubmissionConfirmationEmail(
  data: SubmissionEmailData,
) {
  const { eventName, demoName, pocName, email } = data;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `Demo Submission Received: ${demoName}`,
      react: SubmissionConfirmationEmail({ eventName, demoName, pocName }),
    });

    if (error) {
      console.error("Failed to send submission confirmation email:", error);
      return { success: false, error };
    }

    console.log("Submission confirmation email sent:", emailData?.id);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Error sending submission confirmation email:", error);
    return { success: false, error };
  }
}

interface StatusUpdateEmailData {
  eventName: string;
  demoName: string;
  pocName: string;
  email: string;
  status: "CONFIRMED" | "REJECTED";
}

export async function sendStatusUpdateEmail(data: StatusUpdateEmailData) {
  const { eventName, demoName, pocName, email, status } = data;

  const subject =
    status === "CONFIRMED"
      ? `Demo Approved: ${demoName}`
      : `Demo Submission Update: ${demoName}`;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject,
      react: StatusUpdateEmail({ eventName, demoName, pocName, status }),
    });

    if (error) {
      console.error("Failed to send status update email:", error);
      return { success: false, error };
    }

    console.log("Status update email sent:", emailData?.id);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Error sending status update email:", error);
    return { success: false, error };
  }
}

interface DemoStats {
  averageRating: number | null;
  totalClaps: number;
  feedbackCount: number;
  tellMeMoreCount: number;
  quickActionCounts: Record<string, number>;
}

interface Comment {
  text: string;
  attendeeName?: string;
}

interface Award {
  name: string;
}

interface PostEventDigestEmailData {
  eventName: string;
  demoName: string;
  pocName: string;
  email: string;
  stats: DemoStats;
  comments: Comment[];
  awardsWon: Award[];
}

export async function sendPostEventDigestEmail(data: PostEventDigestEmailData) {
  const { eventName, demoName, pocName, email, stats, comments, awardsWon } =
    data;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `Your Demo Results: ${demoName} at ${eventName}`,
      react: PostEventDigestEmail({
        eventName,
        demoName,
        pocName,
        stats,
        comments,
        awardsWon,
      }),
    });

    if (error) {
      console.error("Failed to send post-event digest email:", error);
      return { success: false, error };
    }

    console.log("Post-event digest email sent:", emailData?.id);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Error sending post-event digest email:", error);
    return { success: false, error };
  }
}
