import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SubmissionConfirmationEmailProps {
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
  pocName: string;
}

export const SubmissionConfirmationEmail = ({
  demoName,
  eventName,
  eventDate,
  eventUrl,
  pocName,
}: SubmissionConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Your demo submission for {eventName} has been received!
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Demo Submission Received! 🎉</Heading>
        <Text style={text}>Hi {pocName},</Text>
        <Text style={text}>
          Thank you for submitting <strong>{demoName}</strong> to{" "}
          <strong>{eventName}</strong>!
        </Text>
        <Text style={text}>
          Your submission has been received and is currently under review by our
          team. We&apos;ll notify you via email once we&apos;ve made a decision on
          your application.
        </Text>
        <Section style={infoBox}>
          <Text style={infoTitle}>📋 Submission Details</Text>
          <Text style={infoText}>
            <strong>Demo:</strong> {demoName}
          </Text>
          <Text style={infoText}>
            <strong>Event:</strong> {eventName}
          </Text>
          <Text style={infoText}>
            <strong>Date:</strong> {eventDate}
          </Text>
        </Section>
        <Section style={buttonContainer}>
          <Button style={button} href={eventUrl}>
            View Event Details
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Questions? Reply to this email or visit{" "}
          <Link href={eventUrl} style={link}>
            the event page
          </Link>
          .
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
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  padding: "0 40px",
};

const infoBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
};

const infoTitle = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const infoText = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0",
};

const buttonContainer = {
  padding: "0 40px",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 40px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
};

const link = {
  color: "#f97316",
  textDecoration: "underline",
};


