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

interface SubmissionConfirmationEmailProps {
  submitterName: string;
  demoTitle: string;
  eventName: string;
  submissionDate: Date;
}

export function SubmissionConfirmationEmail({
  submitterName,
  demoTitle,
  eventName,
  submissionDate,
}: SubmissionConfirmationEmailProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(submissionDate);

  return (
    <Html>
      <Head />
      <Preview>Your demo submission for {eventName} has been received!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient accent */}
          <Section style={headerSection}>
            <Heading style={h1}>Submission Received! 🎉</Heading>
          </Section>

          {/* Main content */}
          <Section style={contentSection}>
            <Text style={greeting}>Hi {submitterName},</Text>
            
            <Text style={text}>
              Thank you for submitting your demo{" "}
              <strong style={highlight}>{demoTitle}</strong> for{" "}
              <strong style={highlight}>{eventName}</strong>.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Submission Date:</strong> {formattedDate}
              </Text>
            </Section>

            <Text style={text}>
              Our team will review your submission and get back to you soon. We
              appreciate your interest in presenting at our event!
            </Text>
          </Section>

          {/* What's Next Section */}
          <Section style={nextStepsSection}>
            <Heading style={sectionTitle}>What&apos;s Next?</Heading>
            <Row>
              <Column>
                <Text style={bulletPoint}>
                  <span style={bullet}>✓</span> We&apos;ll review your
                  submission and notify you of the status
                </Text>
                <Text style={bulletPoint}>
                  <span style={bullet}>✓</span> If selected, you&apos;ll
                  receive confirmation details via email
                </Text>
                <Text style={bulletPoint}>
                  <span style={bullet}>✓</span> Keep an eye on your inbox for
                  updates
                </Text>
              </Column>
            </Row>
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
  backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "40px 32px",
  textAlign: "center" as const,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

const infoBox = {
  backgroundColor: "#f7fafc",
  borderLeft: "4px solid #667eea",
  padding: "16px 20px",
  margin: "24px 0",
  borderRadius: "6px",
};

const infoText = {
  color: "#2d3748",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
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
  color: "#667eea",
  fontWeight: "bold",
  marginRight: "12px",
  fontSize: "16px",
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

