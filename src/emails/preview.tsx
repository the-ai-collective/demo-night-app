import SubmissionConfirmationEmail from "./SubmissionConfirmation";
import SubmissionStatusUpdateEmail from "./SubmissionStatusUpdate";

// Preview data for development
const sampleData = {
  submitterName: "John Doe",
  demoName: "AI-Powered Code Assistant",
  eventName: "Demo Night - November 2025",
  eventDate: "Friday, November 22, 2025",
  eventUrl: "https://demonight.com/events/nov-2025",
};

// Export email previews for React Email dev server
export function SubmissionConfirmationPreview() {
  return <SubmissionConfirmationEmail {...sampleData} />;
}

export function SubmissionConfirmedPreview() {
  return <SubmissionStatusUpdateEmail {...sampleData} status="CONFIRMED" />;
}

export function SubmissionRejectedPreview() {
  return <SubmissionStatusUpdateEmail {...sampleData} status="REJECTED" />;
}
