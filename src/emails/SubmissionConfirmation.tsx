import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SubmissionConfirmationEmailProps {
  eventName: string;
  demoName: string;
  pocName: string;
}

export function SubmissionConfirmationEmail({
  eventName,
  demoName,
  pocName,
}: SubmissionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Demo Submission Received: {demoName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={headerTitle}>Demo Submission Received!</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hi {pocName},</Text>

            <Text style={paragraph}>
              Thank you for submitting <strong>{demoName}</strong> to{" "}
              <strong>{eventName}</strong>!
            </Text>

            <Section style={stepsBox}>
              <Heading as="h3" style={stepsTitle}>
                What happens next?
              </Heading>
              <Text style={stepItem}>1. Our team will review your submission</Text>
              <Text style={stepItem}>
                2. You&apos;ll receive an email when your demo is approved or if we
                need more information
              </Text>
              <Text style={stepItem}>
                3. Once approved, you&apos;ll get details about the event schedule
              </Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions, feel free to reach out to us.
            </Text>

            <Text style={signature}>
              Best regards,
              <br />
              <strong>The AI Collective Team</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            &copy; {new Date().getFullYear()} AI Collective. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const headerSection = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "30px",
  borderRadius: "10px 10px 0 0",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const contentSection = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "0 0 10px 10px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
  marginTop: "0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
};

const stepsBox = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  margin: "20px 0",
};

const stepsTitle = {
  color: "#667eea",
  fontSize: "18px",
  fontWeight: "600",
  marginTop: "0",
  marginBottom: "12px",
};

const stepItem = {
  fontSize: "14px",
  lineHeight: "1.8",
  color: "#333333",
  margin: "0",
};

const signature = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
  marginBottom: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  textAlign: "center" as const,
};

export default SubmissionConfirmationEmail;
