import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SubmissionConfirmationEmailProps {
  submitterName: string;
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
}

export const SubmissionConfirmationEmail = ({
  submitterName,
  demoName,
  eventName,
  eventDate,
  eventUrl,
}: SubmissionConfirmationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Demo Submission Received! 🎉</Heading>
        <Text style={text}>Hi {submitterName},</Text>
        <Text style={text}>
          Thank you for submitting your demo <strong>{demoName}</strong> to{" "}
          <strong>{eventName}</strong>!
        </Text>
        <Section style={infoSection}>
          <Text style={infoText}>
            <strong>Event:</strong> {eventName}
          </Text>
          <Text style={infoText}>
            <strong>Date:</strong> {eventDate}
          </Text>
          <Text style={infoText}>
            <strong>Your Demo:</strong> {demoName}
          </Text>
        </Section>
        <Text style={text}>
          We&apos;ve received your submission and our team will review it shortly.
          You&apos;ll receive another email once we&apos;ve made a decision about your
          demo.
        </Text>
        <Text style={text}>
          In the meantime, you can learn more about the event at:
        </Text>
        <Text style={text}>
          <Link href={eventUrl} style={link}>
            {eventUrl}
          </Link>
        </Text>
        <Text style={footer}>
          If you have any questions, please don&apos;t hesitate to reach out.
        </Text>
        <Text style={footer}>
          Best regards,
          <br />
          The {eventName} Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SubmissionConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0 20px",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  padding: "0 40px",
};

const infoSection = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "20px",
};

const infoText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
  padding: "0 40px",
};
