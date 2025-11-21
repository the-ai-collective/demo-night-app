import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SubmissionConfirmationEmailProps {
  submissionName: string;
  submissionTagline: string;
  submitterEmail: string;
  submitterName: string;
  eventName: string;
  eventDate: Date;
  eventUrl: string;
}

export const SubmissionConfirmationEmail = ({
  submissionName,
  submissionTagline,
  submitterName,
  eventName,
  eventDate,
  eventUrl,
}: SubmissionConfirmationEmailProps) => {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Html>
      <Head />
      <Preview>Your demo submission has been received!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Submission Received! 🎉</Heading>
          <Text style={text}>
            Hi {submitterName},
          </Text>
          <Text style={text}>
            Thank you for submitting your demo to <strong>{eventName}</strong>!
            We've received your submission and our team will review it shortly.
          </Text>

          <Section style={box}>
            <Text style={label}>Demo Name</Text>
            <Text style={value}>{submissionName}</Text>

            <Text style={label}>Tagline</Text>
            <Text style={value}>{submissionTagline}</Text>

            <Text style={label}>Event</Text>
            <Text style={value}>{eventName}</Text>

            <Text style={label}>Event Date</Text>
            <Text style={value}>{formattedDate}</Text>
          </Section>

          <Text style={text}>
            <strong>What's Next?</strong>
          </Text>
          <Text style={text}>
            Our team will review your submission and get back to you soon. You'll
            receive an email notification once your submission status has been
            updated.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={eventUrl}>
              View Event Details
            </Button>
          </Section>

          <Text style={footer}>
            If you have any questions, please don't hesitate to reach out.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Demo Night Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

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
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const box = {
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  backgroundColor: "#f9fafb",
};

const label = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "600",
  margin: "12px 0 4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const value = {
  color: "#333",
  fontSize: "16px",
  margin: "0 0 16px",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

