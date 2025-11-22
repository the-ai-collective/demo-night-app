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

interface SubmissionConfirmationEmailProps {
  companyName: string;
  submitterName: string;
  eventName: string;
  eventDate: string;
  submissionUrl?: string;
}

export const SubmissionConfirmationEmail = ({
  companyName,
  submitterName,
  eventName,
  eventDate,
  submissionUrl,
}: SubmissionConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your submission to {eventName} has been received!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={box}>
          <Text style={heading}>🚀 Submission Confirmed</Text>
        </Section>

        {/* Content */}
        <Section style={box}>
          <Text style={paragraph}>
            Hi {submitterName},
          </Text>
          <Text style={paragraph}>
            Thank you for submitting <strong>{companyName}</strong> to{" "}
            <strong>{eventName}</strong>!
          </Text>

          <Hr style={hr} />

          <Text style={subheading}>Submission Details:</Text>
          <div style={detailsContainer}>
            <div style={detailRow}>
              <Text style={detailLabel}>Company:</Text>
              <Text style={detailValue}>{companyName}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Event:</Text>
              <Text style={detailValue}>{eventName}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Date:</Text>
              <Text style={detailValue}>{eventDate}</Text>
            </div>
          </div>

          <Hr style={hr} />

          <Text style={paragraph}>
            We've received your submission and our team will review it shortly.
            You'll receive an email update once we've made a decision.
          </Text>

          {submissionUrl && (
            <Section style={{ textAlign: "center" }}>
              <Button style={button} href={submissionUrl}>
                View Submission
              </Button>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={paragraph}>
            If you have any questions, feel free to reach out to us.
          </Text>
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

SubmissionConfirmationEmail.PreviewProps = {
  companyName: "Acme Corp",
  submitterName: "John Doe",
  eventName: "SF Demo Night",
  eventDate: "December 5, 2025",
  submissionUrl: "https://demo.night/submissions/123",
} as SubmissionConfirmationEmailProps;

export default SubmissionConfirmationEmail;

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
  color: "#1f2937",
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

const detailsContainer = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  margin: "12px 0",
};

const detailRow = {
  display: "flex" as const,
  justifyContent: "space-between",
  marginBottom: "8px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
};

const detailValue = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "500",
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