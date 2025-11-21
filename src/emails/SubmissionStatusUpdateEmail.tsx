import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SubmissionStatusUpdateEmailProps {
  submissionName: string;
  submissionTagline: string;
  submitterEmail: string;
  submitterName: string;
  eventName: string;
  eventDate: Date;
  eventUrl: string;
  status: "CONFIRMED" | "REJECTED";
  adminComment?: string | null;
}

export const SubmissionStatusUpdateEmail = ({
  submissionName,
  submissionTagline,
  submitterName,
  eventName,
  eventDate,
  eventUrl,
  status,
  adminComment,
}: SubmissionStatusUpdateEmailProps) => {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isConfirmed = status === "CONFIRMED";

  return (
    <Html>
      <Head />
      <Preview>
        {isConfirmed
          ? "Your demo has been confirmed!"
          : "Update on your demo submission"}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isConfirmed ? "🎉 Your Demo Has Been Confirmed!" : "Update on Your Submission"}
          </Heading>
          <Text style={text}>
            Hi {submitterName},
          </Text>

          {isConfirmed ? (
            <>
              <Text style={text}>
                Great news! Your demo submission for <strong>{eventName}</strong>{" "}
                has been <strong>confirmed</strong>. We&apos;re excited to have you
                present at the event!
              </Text>

              <Section style={successBox}>
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
                <strong>What&apos;s Next?</strong>
              </Text>
              <Text style={text}>
                Please make sure you&apos;re prepared for the event. If you have any
                questions or need to make changes to your submission, please
                reach out to us as soon as possible.
              </Text>

              {adminComment && (
                <Section style={commentBox}>
                  <Text style={commentLabel}>Message from the team:</Text>
                  <Text style={commentText}>{adminComment}</Text>
                </Section>
              )}
            </>
          ) : (
            <>
              <Text style={text}>
                Thank you for your interest in presenting at{" "}
                <strong>{eventName}</strong>. After careful review, we&apos;re unable
                to include your demo in this event.
              </Text>

              <Section style={infoBox}>
                <Text style={label}>Demo Name</Text>
                <Text style={value}>{submissionName}</Text>

                <Text style={label}>Event</Text>
                <Text style={value}>{eventName}</Text>
              </Section>

              {adminComment && (
                <Section style={commentBox}>
                  <Text style={commentLabel}>Feedback:</Text>
                  <Text style={commentText}>{adminComment}</Text>
                </Section>
              )}

              <Text style={text}>
                We encourage you to submit again for future events. We&apos;re always
                looking for innovative demos to showcase!
              </Text>
            </>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={eventUrl}>
              View Event Details
            </Button>
          </Section>

          <Text style={footer}>
            If you have any questions, please don&apos;t hesitate to reach out.
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

const successBox = {
  border: "2px solid #10b981",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  backgroundColor: "#f0fdf4",
};

const infoBox = {
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  backgroundColor: "#f9fafb",
};

const commentBox = {
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "20px",
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

const commentLabel = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const commentText = {
  color: "#333",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  fontStyle: "italic" as const,
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

