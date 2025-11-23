import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SubmissionStatusUpdateEmailProps {
  companyName?: string;
  submitterName?: string;
  eventName?: string;
  status?: string;
  message?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const subheading = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600" as const,
  margin: "12px 0",
  color: "#374151",
};

export const SubmissionStatusUpdateEmail = ({
  companyName = "Your Company",
  submitterName = "there",
  eventName = "Event",
  status = "PENDING",
  message,
}: SubmissionStatusUpdateEmailProps) => {
  const isConfirmed = status === "CONFIRMED";
  const isRejected = status === "REJECTED";
  const isWaitlisted = status === "WAITLISTED";
  const isAwaiting = status === "AWAITING_CONFIRMATION";
  const isPending = status === "PENDING";
  const isCancelled = status === "CANCELLED";

  const getStatusContent = () => {
    if (isConfirmed) {
      return {
        icon: "✅",
        title: "Approved",
        color: "#10b981",
        heading: `🚀 Congratulations!`,
        body: `Hi ${submitterName},\n\nGreat news! Your submission for ${companyName} has been approved for ${eventName}!`,
        details: `We're excited to have you present. Check your email for event details and next steps.`,
      };
    }
    if (isRejected) {
      return {
        icon: "❌",
        title: "Status Update",
        color: "#ef4444",
        heading: "Status Update",
        body: `Hi ${submitterName},\n\nThank you for submitting ${companyName} to ${eventName}.`,
        details: `Unfortunately, it was not selected for this event. We received many amazing submissions and had to make some tough choices. We encourage you to apply again for future events!`,
      };
    }
    if (isWaitlisted) {
      return {
        icon: "⏳",
        title: "Waitlisted",
        color: "#f59e0b",
        heading: "Waitlisted",
        body: `Hi ${submitterName},\n\nThank you for submitting ${companyName} to ${eventName}.`,
        details: `Your submission has been placed on our waitlist. We'll reach out if a spot becomes available.`,
      };
    }
    if (isAwaiting) {
      return {
        icon: "🎯",
        title: "Shortlisted",
        color: "#3b82f6",
        heading: "🎯 You've Been Shortlisted!",
        body: `Hi ${submitterName},\n\nCongratulations! ${companyName} has been shortlisted for ${eventName}.`,
        details: `We're impressed with your submission and we'd love to have you present. Are you available to demo on the event date?`,
      };
    }
    if (isPending) {
      return {
        icon: "📋",
        title: "Received",
        color: "#8b5cf6",
        heading: "📋 Submission Received",
        body: `Hi ${submitterName},\n\nThank you for submitting ${companyName} to ${eventName}.`,
        details: `We've received your submission and our team will review it shortly. You'll receive an email update once we've made a decision.`,
      };
    }
    if (isCancelled) {
      return {
        icon: "❌",
        title: "Cancelled",
        color: "#dc2626",
        heading: "Submission Cancelled",
        body: `Hi ${submitterName},\n\nWe regret to inform you that your submission for ${companyName} has been cancelled.`,
        details: `If you have any questions, please feel free to reach out to us.`,
      };
    }

    return {
      icon: "📨",
      title: "Update",
      color: "#6366f1",
      heading: "Update on Your Submission",
      body: `Hi ${submitterName},\n\nHere's an update on your ${companyName} submission to ${eventName}.`,
      details: "Thank you for your participation!",
    };
  };

  const content = getStatusContent();

  return (
    <Html>
      <Head />
      <Preview>
        {content.heading} - {companyName}
      </Preview>
      <Body style={{ backgroundColor: "#f3f4f6" }}>
        <Container>
          <Section style={{ backgroundColor: "#ffffff", margin: "0 auto" }}>
            <Row style={{ width: "100%" }}>
              <Section style={{ padding: "48px" }}>
                <Text style={{ fontSize: "32px", margin: "16px 0" }}>
                  {content.icon} {content.title}
                </Text>
                <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
                  {content.body}
                </Text>

                <Hr style={hr} />

                <Text style={subheading}>Submission Details:</Text>

                <Section
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px",
                    borderRadius: "8px",
                    margin: "12px 0",
                  }}
                >
                  <Row>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "600",
                        margin: "8px 0",
                      }}
                    >
                      Company:
                    </Text>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {companyName}
                    </Text>
                  </Row>

                  <Row>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "600",
                        margin: "8px 0",
                      }}
                    >
                      Event:
                    </Text>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {eventName}
                    </Text>
                  </Row>
                </Section>

                <Hr style={hr} />

                <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
                  {content.details}
                </Text>

                {message && (
                  <>
                    <Hr style={hr} />
                    <Text style={subheading}>Message from organizers:</Text>
                    <Section
                      style={{
                        backgroundColor: "#f3f4f6",
                        padding: "16px",
                        borderRadius: "8px",
                        margin: "12px 0",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#374151",
                          fontStyle: "italic",
                          margin: "0",
                        }}
                      >
                        &quot;{message}&quot;
                      </Text>
                    </Section>
                  </>
                )}

                <Hr style={hr} />

                <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
                  If you have any questions, feel free to reach out to us.
                </Text>
                <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
                  Best regards,
                  <br />
                  <strong>Demo Night Team</strong>
                </Text>
              </Section>
            </Row>

            <Section style={{ backgroundColor: "#f3f4f6", padding: "24px 48px" }}>
              <Text style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
                © 2025 Demo Night. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SubmissionStatusUpdateEmail;