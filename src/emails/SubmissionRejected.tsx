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

interface SubmissionRejectedEmailProps {
  demoName: string;
  eventName: string;
  eventUrl: string;
  pocName: string;
}

export const SubmissionRejectedEmail = ({
  demoName,
  eventName,
  eventUrl,
  pocName,
}: SubmissionRejectedEmailProps) => (
  <Html>
    <Head />
    <Preview>Update on your demo submission for {eventName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Demo Submission Update</Heading>
        <Text style={text}>Hi {pocName},</Text>
        <Text style={text}>
          Thank you for your interest in presenting <strong>{demoName}</strong>{" "}
          at <strong>{eventName}</strong>.
        </Text>
        <Text style={text}>
          After careful consideration, we&apos;ve decided not to move forward with
          your demo for this particular event. This was a difficult decision, as
          we received many excellent submissions.
        </Text>
        <Section style={infoBox}>
          <Text style={infoText}>
            We encourage you to:
          </Text>
          <Text style={listItem}>
            • Submit to future events as they become available
          </Text>
          <Text style={listItem}>
            • Attend the event to network and see other demos
          </Text>
          <Text style={listItem}>
            • Stay connected with the community
          </Text>
        </Section>
        <Section style={buttonContainer}>
          <Button style={button} href={eventUrl}>
            View Event Details
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          We appreciate your understanding and hope to see you at future events.
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

export default SubmissionRejectedEmail;

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

const infoText = {
  color: "#555",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const listItem = {
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
  backgroundColor: "#6366f1",
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
  color: "#6366f1",
  textDecoration: "underline",
};


