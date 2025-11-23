import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface SubmissionApprovedEmailProps {
  demoTitle: string;
  eventName: string;
  submitterName: string;
  eventUrl: string;
  eventDate: string;
}

export const SubmissionApprovedEmail = ({
  demoTitle,
  eventName,
  submitterName,
  eventUrl,
  eventDate,
}: SubmissionApprovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Congratulations! Your demo has been approved for {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎊 Demo Approved!</Heading>

          <Text style={text}>Hi {submitterName},</Text>

          <Text style={text}>
            Congratulations! We&apos;re excited to let you know that your demo{" "}
            <strong>{demoTitle}</strong> has been approved for{" "}
            <strong>{eventName}</strong>!
          </Text>

          <Section style={approvedBox}>
            <Text style={approvedTitle}>✅ You&apos;re all set!</Text>
            <Text style={approvedText}>
              <strong>Event:</strong> {eventName}<br />
              <strong>Date:</strong> {eventDate}
            </Text>
          </Section>

          <Section style={nextSteps}>
            <Text style={nextStepsTitle}>
              <strong>What to prepare:</strong>
            </Text>
            <Text style={nextStepsText}>
              • Prepare your demo presentation (5-10 minutes recommended)<br />
              • Test all technical requirements beforehand<br />
              • Arrive 15 minutes early for setup<br />
              • Bring any necessary equipment or materials
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={eventUrl}>
              View Event Details
            </Button>
          </Section>

          <Text style={text}>
            We&apos;re looking forward to seeing your demo! If you have any questions or need
            assistance, please don&apos;t hesitate to reach out.
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

export default SubmissionApprovedEmail;

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
  fontSize: "32px",
  fontWeight: "bold",
  margin: "40px 0 20px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const approvedBox = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  borderRadius: "16px",
  padding: "32px",
  margin: "32px 0",
  textAlign: "center" as const,
};

const approvedTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const approvedText = {
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
};

const nextSteps = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e5e7eb",
};

const nextStepsTitle = {
  color: "#333",
  fontSize: "16px",
  margin: "0 0 12px",
};

const nextStepsText = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#667eea",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
};
