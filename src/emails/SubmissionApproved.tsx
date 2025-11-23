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

interface SubmissionApprovedEmailProps {
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
  pocName: string;
}

export const SubmissionApprovedEmail = ({
  demoName,
  eventName,
  eventDate,
  eventUrl,
  pocName,
}: SubmissionApprovedEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Congratulations! Your demo has been confirmed for {eventName}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Demo Confirmed!</Heading>
        <Text style={text}>Hi {pocName},</Text>
        <Text style={text}>
          Exciting news! <strong>{demoName}</strong> has been confirmed for{" "}
          <strong>{eventName}</strong>!
        </Text>
        <Section style={highlightBox}>
          <Text style={highlightText}>
            ✅ You&apos;re all set to present at the event
          </Text>
        </Section>
        <Section style={infoBox}>
          <Text style={infoTitle}>📋 Event Details</Text>
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
          <strong>Next Steps:</strong>
        </Text>
        <Text style={listItem}>
          • Check the event page for the exact time and location
        </Text>
        <Text style={listItem}>
          • Prepare your demo (we recommend 2-3 minutes)
        </Text>
        <Text style={listItem}>
          • Arrive 15 minutes early for setup
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={eventUrl}>
            View Event Details
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Questions or need to make changes? Reply to this email or contact the
          event organizers at{" "}
          <Link href={eventUrl} style={link}>
            the event page
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SubmissionApprovedEmail;

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

const highlightBox = {
  backgroundColor: "#dcfce7",
  borderLeft: "4px solid #16a34a",
  margin: "24px 40px",
  padding: "16px 20px",
};

const highlightText = {
  color: "#15803d",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
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

const listItem = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "8px 0",
  padding: "0 40px",
};

const buttonContainer = {
  padding: "0 40px",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#16a34a",
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
  color: "#16a34a",
  textDecoration: "underline",
};


