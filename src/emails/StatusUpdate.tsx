import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface StatusUpdateEmailProps {
  eventName: string;
  demoName: string;
  pocName: string;
  status: "CONFIRMED" | "REJECTED";
}

export function StatusUpdateEmail({
  eventName,
  demoName,
  pocName,
  status,
}: StatusUpdateEmailProps) {
  const isConfirmed = status === "CONFIRMED";

  return (
    <Html>
      <Head />
      <Preview>
        {isConfirmed
          ? `Demo Approved: ${demoName}`
          : `Demo Submission Update: ${demoName}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={isConfirmed ? headerSectionApproved : headerSectionRejected}>
            <Heading style={headerTitle}>
              {isConfirmed
                ? "Your Demo Has Been Approved!"
                : "Demo Submission Update"}
            </Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hi {pocName},</Text>

            {isConfirmed ? (
              <>
                <Text style={paragraph}>
                  Great news! Your demo <strong>{demoName}</strong> has been
                  approved for <strong>{eventName}</strong>!
                </Text>

                <Section style={stepsBoxApproved}>
                  <Heading as="h3" style={stepsTitleApproved}>
                    Next Steps
                  </Heading>
                  <Text style={stepItem}>
                    &bull; Keep an eye out for event schedule details
                  </Text>
                  <Text style={stepItem}>
                    &bull; Prepare your demo presentation
                  </Text>
                  <Text style={stepItem}>
                    &bull; Make sure your demo is ready to showcase
                  </Text>
                </Section>

                <Text style={paragraph}>
                  We&apos;re excited to have you present at the event!
                </Text>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  Thank you for your interest in presenting at{" "}
                  <strong>{eventName}</strong>.
                </Text>

                <Text style={paragraph}>
                  After careful review, we regret to inform you that we&apos;re
                  unable to include <strong>{demoName}</strong> in this
                  event&apos;s lineup.
                </Text>

                <Section style={stepsBox}>
                  <Text style={infoText}>
                    This decision was made due to limited spots and the high
                    number of quality submissions we received. We encourage you
                    to submit again for future events!
                  </Text>
                </Section>

                <Text style={paragraph}>
                  Thank you for your understanding, and we hope to see your demo
                  at a future event.
                </Text>
              </>
            )}

            <Text style={signature}>
              Best regards,
              <br />
              <strong>The AI Collective Team</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            &copy; {new Date().getFullYear()} AI Collective. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const headerSectionApproved = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  padding: "30px",
  borderRadius: "10px 10px 0 0",
  textAlign: "center" as const,
};

const headerSectionRejected = {
  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
  padding: "30px",
  borderRadius: "10px 10px 0 0",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const contentSection = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "0 0 10px 10px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
  marginTop: "0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
};

const stepsBoxApproved = {
  backgroundColor: "#ecfdf5",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #a7f3d0",
  margin: "20px 0",
};

const stepsTitleApproved = {
  color: "#10b981",
  fontSize: "18px",
  fontWeight: "600",
  marginTop: "0",
  marginBottom: "12px",
};

const stepsBox = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  margin: "20px 0",
};

const stepItem = {
  fontSize: "14px",
  lineHeight: "1.8",
  color: "#333333",
  margin: "0",
};

const infoText = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#333333",
  margin: "0",
};

const signature = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
  marginBottom: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  textAlign: "center" as const,
};

export default StatusUpdateEmail;
