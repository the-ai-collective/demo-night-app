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

interface SubmissionStatusUpdateEmailProps {
  submitterName: string;
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
  status: "CONFIRMED" | "REJECTED";
}

export const SubmissionStatusUpdateEmail = ({
  submitterName,
  demoName,
  eventName,
  eventDate,
  eventUrl,
  status,
}: SubmissionStatusUpdateEmailProps) => {
  const isConfirmed = status === "CONFIRMED";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isConfirmed
              ? "Your Demo Has Been Confirmed! 🎉"
              : "Demo Submission Update"}
          </Heading>
          <Text style={text}>Hi {submitterName},</Text>
          {isConfirmed ? (
            <>
              <Text style={text}>
                Great news! Your demo <strong>{demoName}</strong> has been
                confirmed for <strong>{eventName}</strong>!
              </Text>
              <Section style={{ ...infoSection, backgroundColor: "#dcfce7" }}>
                <Text style={infoText}>
                  <strong>✓ Status:</strong> CONFIRMED
                </Text>
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
              <Text style={text}>
                • Mark your calendar for {eventDate}
                <br />
                • Prepare your demo presentation
                <br />
                • We&apos;ll send you more details about the event schedule closer to
                the date
                <br />• Make sure your demo is ready to showcase!
              </Text>
              <Text style={text}>
                We&apos;re excited to see your demo at the event! Visit the event
                page for more information:
              </Text>
              <Text style={text}>
                <Link href={eventUrl} style={link}>
                  {eventUrl}
                </Link>
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>
                Thank you for submitting <strong>{demoName}</strong> to{" "}
                <strong>{eventName}</strong>.
              </Text>
              <Text style={text}>
                After careful review, we regret to inform you that we won&apos;t be
                able to include your demo in this event. We received many
                excellent submissions and had to make some difficult decisions.
              </Text>
              <Section style={{ ...infoSection, backgroundColor: "#fef2f2" }}>
                <Text style={infoText}>
                  <strong>Status:</strong> Not Selected
                </Text>
                <Text style={infoText}>
                  <strong>Event:</strong> {eventName}
                </Text>
              </Section>
              <Text style={text}>
                We encourage you to:
                <br />
                • Submit to future events - we&apos;d love to see more from you!
                <br />
                • Attend the event as an audience member to network and learn
                <br />• Keep building and refining your demo
              </Text>
              <Text style={text}>
                Event details can be found at:
              </Text>
              <Text style={text}>
                <Link href={eventUrl} style={link}>
                  {eventUrl}
                </Link>
              </Text>
            </>
          )}
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
};

export default SubmissionStatusUpdateEmail;

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
