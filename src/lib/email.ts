import { Resend } from "resend";
import { env } from "~/env";

export const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
}: SendEmailParams) {
  try {
    console.log("📧 Attempting to send email...");
    console.log("   To:", to);
    console.log("   Subject:", subject);

    const result = await resend.emails.send({
      from: "noreply@resend.dev",
      to,
      subject,
      react,
      replyTo,
    });

    if (result.error) {
      console.error("❌ Resend email error:", result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    console.log("✅ Email sent successfully:", result.data?.id);
    return result.data;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}