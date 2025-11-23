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

interface SubmissionRejectedEmailProps {
  demoTitle: string;
  eventName: string;
  submitterName: string;
}

export const SubmissionRejectedEmail = ({
  demoTitle,
  eventName,
  submitterName,
}: SubmissionRejectedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Update on your demo submission for {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Demo Submission Update</Heading>

          <Text style={text}>Hi {submitterName},</Text>

          <Text style={text}>
            Thank you for your interest in presenting <strong>{demoTitle}</strong> at{" "}
            <strong>{eventName}</strong>.
          </Text>

          <Section style={statusBox}>
            <Text style={statusText}>
              After careful review, we regret to inform you that we won&apos;t be able to
              include your demo in this event. We received many excellent submissions
              and had to make difficult decisions due to time and capacity constraints.
            </Text>
          </Section>

          <Text style={text}>
            We want to emphasize that this decision doesn&apos;t reflect on the quality or
            potential of your work. We encourage you to:
          </Text>

          <Section style={encouragementBox}>
            <Text style={encouragementText}>
              • Submit to future demo nights - we&apos;d love to see you apply again<br />
              • Join us as an attendee to network and learn<br />
              • Stay connected with our community for upcoming opportunities
            </Text>
          </Section>

          <Text style={text}>
            Thank you again for your submission and for being part of our community.
            We hope to see you at future events!
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

export default SubmissionRejectedEmail;

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

const statusBox = {
  backgroundColor: "#fff7ed",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const statusText = {
  color: "#92400e",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
};

const encouragementBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e5e7eb",
};

const encouragementText = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
};
