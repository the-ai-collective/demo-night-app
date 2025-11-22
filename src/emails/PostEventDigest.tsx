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

interface DemoStats {
  averageRating: number | null;
  totalClaps: number;
  feedbackCount: number;
  tellMeMoreCount: number;
  quickActionCounts: Record<string, number>;
}

interface Comment {
  text: string;
  attendeeName?: string;
}

interface Award {
  name: string;
}

interface PostEventDigestEmailProps {
  eventName: string;
  demoName: string;
  pocName: string;
  stats: DemoStats;
  comments: Comment[];
  awardsWon: Award[];
}

export function PostEventDigestEmail({
  eventName,
  demoName,
  pocName,
  stats,
  comments,
  awardsWon,
}: PostEventDigestEmailProps) {
  const hasAwards = awardsWon.length > 0;

  return (
    <Html>
      <Head />
      <Preview>See how your demo performed at {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={headerTitle}>Your Demo Results Are In!</Heading>
            <Text style={headerSubtitle}>{eventName}</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hi {pocName},</Text>

            <Text style={paragraph}>
              Thank you for presenting <strong>{demoName}</strong> at{" "}
              <strong>{eventName}</strong>! Here&apos;s how your demo performed:
            </Text>

            {/* Stats Section */}
            <Section style={statsSection}>
              <Heading as="h3" style={sectionTitle}>
                Performance Summary
              </Heading>
              <div style={statsGrid}>
                <div style={statBox}>
                  <Text style={statValue}>
                    {stats.averageRating !== null
                      ? stats.averageRating.toFixed(1)
                      : "N/A"}
                  </Text>
                  <Text style={statLabel}>Average Rating</Text>
                </div>
                <div style={statBox}>
                  <Text style={statValue}>{stats.totalClaps}</Text>
                  <Text style={statLabel}>Total Claps</Text>
                </div>
                <div style={statBox}>
                  <Text style={statValue}>{stats.feedbackCount}</Text>
                  <Text style={statLabel}>Feedback Received</Text>
                </div>
                <div style={statBox}>
                  <Text style={statValue}>{stats.tellMeMoreCount}</Text>
                  <Text style={statLabel}>People Interested</Text>
                </div>
              </div>
            </Section>

            {/* Awards Section */}
            {hasAwards && (
              <Section style={awardsSection}>
                <Heading as="h3" style={sectionTitle}>
                  Awards
                </Heading>
                {awardsWon.map((award, index) => (
                  <Text key={index} style={awardItem}>
                    🏆 Congratulations! You won: <strong>{award.name}</strong>
                  </Text>
                ))}
              </Section>
            )}

            {/* Quick Actions Breakdown */}
            {Object.keys(stats.quickActionCounts).length > 0 && (
              <Section style={quickActionsSection}>
                <Heading as="h3" style={sectionTitle}>
                  Interest Breakdown
                </Heading>
                {Object.entries(stats.quickActionCounts).map(
                  ([action, count]) => (
                    <Text key={action} style={quickActionItem}>
                      {action}: <strong>{count}</strong> attendees
                    </Text>
                  ),
                )}
              </Section>
            )}

            {/* Comments Section */}
            <Section style={commentsSection}>
              <Heading as="h3" style={sectionTitle}>
                What Attendees Said
              </Heading>
              {comments.length > 0 ? (
                comments.slice(0, 5).map((comment, index) => (
                  <div key={index} style={commentBox}>
                    <Text style={commentText}>&ldquo;{comment.text}&rdquo;</Text>
                    {comment.attendeeName && (
                      <Text style={commentAuthor}>— {comment.attendeeName}</Text>
                    )}
                  </div>
                ))
              ) : (
                <Text style={noCommentsText}>
                  No comments were left for your demo.
                </Text>
              )}
            </Section>

            <Hr style={hr} />

            <Text style={closingNote}>
              Thank you for being part of <strong>{eventName}</strong>. We hope
              to see you at future events!
            </Text>

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

const headerSection = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
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

const headerSubtitle = {
  color: "#e0e7ff",
  fontSize: "16px",
  marginTop: "8px",
  marginBottom: "0",
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

const sectionTitle = {
  color: "#6366f1",
  fontSize: "18px",
  fontWeight: "600",
  marginTop: "0",
  marginBottom: "16px",
};

const statsSection = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  margin: "20px 0",
};

const statsGrid = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "16px",
  justifyContent: "space-between",
};

const statBox = {
  flex: "1 1 45%",
  textAlign: "center" as const,
  padding: "12px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const statValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#6366f1",
  margin: "0",
};

const statLabel = {
  fontSize: "12px",
  color: "#64748b",
  margin: "4px 0 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const awardsSection = {
  backgroundColor: "#fef3c7",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #fcd34d",
  margin: "20px 0",
};

const awardItem = {
  fontSize: "16px",
  color: "#92400e",
  margin: "8px 0",
};

const quickActionsSection = {
  backgroundColor: "#ecfdf5",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #a7f3d0",
  margin: "20px 0",
};

const quickActionItem = {
  fontSize: "14px",
  color: "#065f46",
  margin: "6px 0",
};

const commentsSection = {
  margin: "20px 0",
};

const commentBox = {
  backgroundColor: "#f8fafc",
  padding: "16px",
  borderRadius: "8px",
  borderLeft: "4px solid #6366f1",
  marginBottom: "12px",
};

const commentText = {
  fontSize: "14px",
  fontStyle: "italic",
  color: "#374151",
  margin: "0",
  lineHeight: "1.6",
};

const commentAuthor = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "8px 0 0 0",
};

const noCommentsText = {
  fontSize: "14px",
  color: "#6b7280",
  fontStyle: "italic",
};

const closingNote = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
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

export default PostEventDigestEmail;
