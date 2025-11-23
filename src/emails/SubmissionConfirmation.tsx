import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SubmissionConfirmationEmailProps {
  demoTitle: string;
  eventName: string;
  submitterName: string;
}

export const SubmissionConfirmationEmail = ({
  demoTitle,
  eventName,
  submitterName,
}: SubmissionConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your demo submission for {eventName} has been received!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Demo Submission Received! 🎉</Heading>

          <Text style={text}>Hi {submitterName},</Text>

          <Text style={text}>
            Thank you for submitting your demo <strong>{demoTitle}</strong> for{" "}
            <strong>{eventName}</strong>!
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>What happens next?</strong>
            </Text>
            <Text style={infoText}>
              • Our team will review your submission<br />
              • You&apos;ll receive an email notification once your demo is reviewed<br />
              • If approved, you&apos;ll get further details about the event
            </Text>
          </Section>

          <Text style={text}>
            We appreciate your interest in participating! If you have any questions in the meantime,
            feel free to reach out to us.
          </Text>

          <Text style={footer}>
            Best regards,<br />
            The Demo Night Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SubmissionConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 40px 48px",
  marginBottom: "64px",
  maxWidth: "580px",
};

const h1 = {
  color: "#333",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "40px 0 20px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const infoBox = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "12px",
  padding: "24px",
  margin: "32px 0",
};

const infoText = {
  color: "#ffffff",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
};
