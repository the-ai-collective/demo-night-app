import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import { env } from "~/env";

import { SubmissionConfirmationEmail } from "~/emails/SubmissionConfirmationEmail";
import { SubmissionStatusUpdateEmail } from "~/emails/SubmissionStatusUpdateEmail";

const sesClient =
  env.AWS_SES_REGION && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? new SESClient({
        region: env.AWS_SES_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

export interface SubmissionEmailData {
  submissionName: string;
  submissionTagline: string;
  submitterEmail: string;
  submitterName: string;
  eventName: string;
  eventDate: Date;
  eventUrl: string;
}

export interface SubmissionStatusUpdateData extends SubmissionEmailData {
  status: "CONFIRMED" | "REJECTED";
  adminComment?: string | null;
}

/**
 * Sends a confirmation email when a submission is created
 */
export async function sendSubmissionConfirmationEmail(
  data: SubmissionEmailData,
): Promise<void> {
  if (!sesClient) {
    console.warn("⚠️  AWS SES not configured. Email not sent.");
    return;
  }

  try {
    // Ensure eventUrl is a full URL
    const eventUrl = data.eventUrl.startsWith("http")
      ? data.eventUrl
      : `${env.NEXT_PUBLIC_URL}${data.eventUrl}`;

    const html = await render(
      SubmissionConfirmationEmail({ ...data, eventUrl }),
    );

    const command = new SendEmailCommand({
      Source: "Demo Night <noreply@carnationlabs.online>",
      Destination: {
        ToAddresses: [data.submitterEmail],
      },
      Message: {
        Subject: {
          Data: `Submission Received: ${data.submissionName}`,
        },
        Body: {
          Html: {
            Data: html,
          },
        },
      },
    });

    await sesClient.send(command);

    console.log(`✅ Confirmation email sent to ${data.submitterEmail}`);
  } catch (error) {
    console.error("❌ Failed to send submission confirmation email:", error);
    // Don't throw - we don't want email failures to break submission creation
  }
}

/**
 * Sends an email when submission status changes to CONFIRMED or REJECTED
 */
export async function sendSubmissionStatusUpdateEmail(
  data: SubmissionStatusUpdateData,
): Promise<void> {
  if (!sesClient) {
    console.warn("⚠️  AWS SES not configured. Email not sent.");
    return;
  }

  try {
    // Ensure eventUrl is a full URL
    const eventUrl = data.eventUrl.startsWith("http")
      ? data.eventUrl
      : `${env.NEXT_PUBLIC_URL}${data.eventUrl}`;

    const html = await render(SubmissionStatusUpdateEmail({ ...data, eventUrl }));

    const subject =
      data.status === "CONFIRMED"
        ? `🎉 Your Demo Has Been Confirmed: ${data.submissionName}`
        : `Update on Your Demo Submission: ${data.submissionName}`;

    const command = new SendEmailCommand({
      Source: "Demo Night <noreply@carnationlabs.online>",
      Destination: {
        ToAddresses: [data.submitterEmail],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: html,
          },
        },
      },
    });

    await sesClient.send(command);

    console.log(
      `✅ Status update email sent to ${data.submitterEmail} (${data.status})`,
    );
  } catch (error) {
    console.error("❌ Failed to send submission status update email:", error);
    // Don't throw - we don't want email failures to break status updates
  }
}

