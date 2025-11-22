import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type SubmissionStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "WAITLISTED" | "AWAITING_CONFIRMATION" | "CANCELLED";

interface SubmissionStatusUpdateEmailProps {
  companyName: string;
  submitterName: string;
  eventName: string;
  status: SubmissionStatus;
  message?: string;
  eventUrl?: string;
  eventDate?: string;
}

export const SubmissionStatusUpdateEmail = ({
  companyName,
  submitterName,
  eventName,
  status,
  message,
  eventUrl,
  eventDate,
}: SubmissionStatusUpdateEmailProps) => {
  const isConfirmed = status === "CONFIRMED";
  const isAwaitingConfirmation = status === "AWAITING_CONFIRMATION";
  const isCancelled = status === "CANCELLED";
  const isPending = status === "PENDING";
  
  const statusIcon = isConfirmed 
    ? "✅" 
    : isAwaitingConfirmation
    ? "🎯"
    : status === "WAITLISTED" 
    ? "⏳"
    : isCancelled
    ? "❌"
    : isPending
    ? "📋"
    : "❌";
  
  const statusTitle = isConfirmed 
    ? "Approved" 
    : isAwaitingConfirmation
    ? "Shortlisted"
    : status === "WAITLISTED" 
    ? "Waitlisted"
    : isCancelled
    ? "Cancelled"
    : isPending
    ? "Received"
    : "Status Update";
  
  const statusColor = isConfirmed 
    ? "#10b981" 
    : isAwaitingConfirmation
    ? "#3b82f6"
    : status === "WAITLISTED" 
    ? "#f59e0b"
    : isCancelled
    ? "#ef4444"
    : isPending
    ? "#8b5cf6"
    : "#ef4444";

  return (
    <Html>
      <Head />
      <Preview>{statusTitle}: {companyName} for {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={box}>
            <Text style={{ ...heading, color: statusColor }}>
              {statusIcon} {statusTitle}
            </Text>
          </Section>

          {/* Content */}
          <Section style={box}>
            <Text style={paragraph}>Hi {submitterName},</Text>

            {isConfirmed ? (
              <>
                <Text style={paragraph}>
                  Great news! <strong>{companyName}</strong> has been selected to demo at{" "}
                  <strong>{eventName}</strong>! 🎉
                </Text>
                <Text style={paragraph}>
                  We're excited to have you on stage. Our team will be in touch with more
                  details about logistics, timing, and what to expect.
                </Text>
              </>
            ) : isAwaitingConfirmation ? (
              <>
                <Text style={paragraph}>
                  Congratulations! <strong>{companyName}</strong> has been shortlisted for{" "}
                  <strong>{eventName}</strong>! 🎯
                </Text>
                {eventDate && (
                  <Text style={paragraph}>
                    The event is scheduled for <strong>{eventDate}</strong>.
                  </Text>
                )}
                <Text style={paragraph}>
                  We would love to have you present your demo. Please confirm if you're available
                  to present on that day.
                </Text>
              </>
            ) : status === "WAITLISTED" ? (
              <>
                <Text style={paragraph}>
                  Thank you for submitting <strong>{companyName}</strong> to{" "}
                  <strong>{eventName}</strong>.
                </Text>
                <Text style={paragraph}>
                  We love your submission! Unfortunately, we're at capacity for this event,
                  but we'd like to keep you in mind as a backup. We'll reach out if a spot
                  opens up.
                </Text>
              </>
            ) : isCancelled ? (
              <>
                <Text style={paragraph}>
                  We regret to inform you that <strong>{companyName}</strong>'s submission to{" "}
                  <strong>{eventName}</strong> has been cancelled.
                </Text>
                <Text style={paragraph}>
                  If you have any questions about this decision, please don't hesitate to reach out.
                </Text>
              </>
            ) : isPending ? (
              <>
                <Text style={paragraph}>
                  Thank you for submitting <strong>{companyName}</strong> to{" "}
                  <strong>{eventName}</strong>!
                </Text>
                <Text style={paragraph}>
                  We've received your submission and our team is reviewing it. You'll hear from us soon
                  with an update on your status.
                </Text>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  Thank you for submitting <strong>{companyName}</strong> to{" "}
                  <strong>{eventName}</strong>.
                </Text>
                <Text style={paragraph}>
                  Unfortunately, it was not selected for this event. We received many amazing
                  submissions and had to make some tough choices.
                </Text>
                <Text style={paragraph}>
                  We encourage you to apply again for future events!
                </Text>
              </>
            )}

            {message && (
              <>
                <Hr style={hr} />
                <Text style={subheading}>Message from organizers:</Text>
                <Text style={{ ...paragraph, backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "6px" }}>
                  "{message}"
                </Text>
              </>
            )}

            <Hr style={hr} />

            {isConfirmed && eventUrl && (
              <Section style={{ textAlign: "center" }}>
                <Button style={button} href={eventUrl}>
                  View Event Details
                </Button>
              </Section>
            )}

            <Text style={paragraph}>
              Best regards,
              <br />
              <strong>Demo Night Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Demo Night. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

SubmissionStatusUpdateEmail.PreviewProps = {
  companyName: "Acme Corp",
  submitterName: "John Doe",
  eventName: "SF Demo Night",
  status: "CONFIRMED",
  message: "We loved your product demo!",
  eventUrl: "https://demo.night/events/sf-demo-night",
} as SubmissionStatusUpdateEmailProps;

export default SubmissionStatusUpdateEmail;

// Styles
const main = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  margin: "16px 0",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "12px 0",
  color: "#374151",
};

const paragraph = {
  color: "#495057",
  fontSize: "16px",
  lineHeight: "1.5",
  textAlign: "left" as const,
  margin: "12px 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
  display: "inline-block",
  margin: "24px 0",
};

const footer = {
  backgroundColor: "#f3f4f6",
  padding: "24px 48px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};