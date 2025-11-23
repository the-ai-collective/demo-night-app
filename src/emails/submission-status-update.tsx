import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface SubmissionStatusUpdateEmailProps {
  submitterName: string;
  demoTitle: string;
  eventName: string;
  status: "CONFIRMED" | "REJECTED";
  message?: string;
}

export function SubmissionStatusUpdateEmail({
  submitterName,
  demoTitle,
  eventName,
  status,
  message,
}: SubmissionStatusUpdateEmailProps) {
  const isConfirmed = status === "CONFIRMED";
  const statusEmoji = isConfirmed ? "🎉" : "💔";
  const statusText = isConfirmed ? "Confirmed" : "Rejected";
  const statusColor = isConfirmed ? "#10b981" : "#ef4444";
  const headerGradient = isConfirmed
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
  const statusBg = isConfirmed ? "#f0fdf4" : "#fef2f2";
  const statusBorder = isConfirmed ? "#10b981" : "#ef4444";

  return (
    <Html>
      <Head />
      <Preview>
        Your demo submission for {eventName} has been {statusText.toLowerCase()}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with status-based gradient */}
          <Section
            style={{
              ...headerSection,
              background: headerGradient,
            }}
          >
            <Heading style={h1}>
              {statusEmoji} Submission {statusText}
            </Heading>
          </Section>

          {/* Main content */}
          <Section style={contentSection}>
            <Text style={greeting}>Hi {submitterName},</Text>

            <Text style={text}>
              We have an update regarding your demo submission{" "}
              <strong style={highlight}>{demoTitle}</strong> for{" "}
              <strong style={highlight}>{eventName}</strong>.
            </Text>

            {/* Status Badge */}
            <Section
              style={{
                ...statusBox,
                borderColor: statusBorder,
                backgroundColor: statusBg,
              }}
            >
              <Text
                style={{
                  ...statusTextStyle,
                  color: statusColor,
                }}
              >
                Status: <strong>{statusText}</strong>
              </Text>
            </Section>

            {/* Status-specific content */}
            {isConfirmed ? (
              <>
                <Text style={text}>
                  <strong>Congratulations!</strong> Your demo has been selected
                  to present at {eventName}. We&apos;re excited to have you
                  showcase your work!
                </Text>

                <Section style={nextStepsSection}>
                  <Heading style={sectionTitle}>Next Steps:</Heading>
                  <Row>
                    <Column>
                      <Text style={bulletPoint}>
                        <span style={bullet}>✓</span> You&apos;ll receive
                        additional details about the event schedule
                      </Text>
                      <Text style={bulletPoint}>
                        <span style={bullet}>✓</span> Please confirm your
                        attendance as soon as possible
                      </Text>
                      <Text style={bulletPoint}>
                        <span style={bullet}>✓</span> Prepare your demo and
                        presentation materials
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </>
            ) : (
              <>
                <Text style={text}>
                  Thank you for your interest in presenting at {eventName}.
                  After careful consideration, we&apos;ve decided not to move
                  forward with your submission at this time.
                </Text>
                <Text style={text}>
                  We received many excellent submissions and had to make
                  difficult choices. We truly appreciate your interest and
                  encourage you to apply for future events!
                </Text>
              </>
            )}

            {/* Admin message if provided */}
            {message && (
              <Section style={messageBox}>
                <Text style={messageLabel}>Additional Note:</Text>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              If you have any questions, please don&apos;t hesitate to reach
              out.
            </Text>
            <Text style={footerSignature}>
              Best regards,<br />
              <strong>The Demo Night Team</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f5f7fa",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  maxWidth: "600px",
};

const headerSection = {
  padding: "40px 32px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0",
  padding: "0",
  textAlign: "center" as const,
  letterSpacing: "-0.5px",
};

const contentSection = {
  padding: "40px 32px",
};

const greeting = {
  color: "#1a202c",
  fontSize: "18px",
  lineHeight: "28px",
  margin: "0 0 24px 0",
  fontWeight: "500",
};

const text = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px 0",
};

const highlight = {
  color: "#667eea",
  fontWeight: "600",
};

const statusBox = {
  padding: "20px",
  borderRadius: "10px",
  border: "3px solid",
  margin: "24px 0",
  textAlign: "center" as const,
};

const statusTextStyle = {
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "-0.3px",
};

const nextStepsSection = {
  backgroundColor: "#f7fafc",
  padding: "32px",
  margin: "32px 0",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const sectionTitle = {
  color: "#1a202c",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 20px 0",
  letterSpacing: "-0.3px",
};

const bulletPoint = {
  color: "#4a5568",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "0 0 12px 0",
  paddingLeft: "8px",
};

const bullet = {
  color: "#10b981",
  fontWeight: "bold",
  marginRight: "12px",
  fontSize: "16px",
};

const messageBox = {
  padding: "20px",
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  margin: "24px 0",
  borderLeft: "4px solid #667eea",
};

const messageLabel = {
  color: "#2d3748",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const messageText = {
  color: "#4a5568",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  fontStyle: "italic",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "40px 0",
  padding: "0 32px",
};

const button = {
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  transition: "all 0.2s ease",
};

const footerSection = {
  padding: "32px",
  borderTop: "1px solid #e2e8f0",
  backgroundColor: "#fafbfc",
};

const footerText = {
  color: "#718096",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px 0",
};

const footerSignature = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

