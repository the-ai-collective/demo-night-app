import type { ReactElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";

import { env } from "~/env";

const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

/**
 * Sends an email using Resend
 * @param options Email options including recipient, subject, and React component
 * @returns Promise resolving to the email result or null if sending fails
 */
export async function sendEmail({
  to,
  subject,
  react,
}: EmailOptions): Promise<{ id: string } | null> {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured. Email not sent.");
    return null;
  }

  try {
    const html = await render(react);

    const { data, error } = await resend.emails.send({
      from: "Demo Night App <onboarding@resend.dev>",
      to,
      subject,
      react,
      html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

/**
 * Sends an email and logs the result without throwing errors
 * This is useful for non-critical emails where we don't want to fail the operation
 */
export async function sendEmailSafely(
  options: EmailOptions,
): Promise<void> {
  const result = await sendEmail(options);
  if (result) {
    console.log(`Email sent successfully to ${options.to}`);
  } else {
    console.warn(`Failed to send email to ${options.to}`);
  }
}

