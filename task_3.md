Product Requirements Document (PRD)

Feature: The Day-After Digest (MVP)

Metadata

Details

Feature Name

The Day-After Digest

Target Audience

Event Attendees, Demo Presenters, Event Organizers

Status

Proposed

Estimated Effort

11.5 Hours (MVP Scope)

1. Problem Statement

The "Post-Event Drop-off"
Live events suffer from a sharp decline in engagement the moment the venue doors close.

Attendees leave inspired but often forget to exchange contact details or miss answers to questions due to venue noise. They lack a structured way to "reconnect" with the demos they loved.

Demoists receive raw, unstructured feedback (e.g., "Good job!") that is hard to act on. They miss the opportunity to address burning questions from investors or users who were too shy to ask live.

Organizers rarely send detailed event recaps because manually collecting photos, summarizing stats, and curating links is operationally heavy.

2. Proposed Solution

An automated, two-stage "Smart Recap" workflow that leverages the AI Collective's brand identity (AI-driven insights) to close the loop on community connection.

Stage 1 (The Input Loop): Immediately after the event, an AI agent aggregates raw feedback comments, synthesizes a "Sentiment Summary" for the presenter, and extracts the "Top 3 Unanswered Questions." The presenter receives a private email prompting them to answer these questions within 24 hours.

Stage 2 (The Output Loop): Once the window closes, the system generates a single, high-signal "Day-After Digest" email sent to all attendees. This email replaces the generic "Thanks for coming" blast with exclusive value: Q&A answers from the founders and direct "Connect" links.

Constraint: To maximize exclusivity and open rates, this recap is Email Only. There is no public web archive. You have to be on the list to get the alpha.

3. User Stories

Role

User Story

Demoist

As a presenter, I want to see a summarized view of my feedback so I can understand my strengths/weaknesses without reading 50 raw comments.

Demoist

As a presenter, I want to answer specific questions I missed live so that I can clarify my product's value to interested investors.

Attendee

As an attendee, I want to receive a list of the demos with their contact info the next day so I can follow up with the ones I liked.

Organizer

As an admin, I want to click one button to generate a professional event recap so I can save hours of manual administrative work.

4. Technical Implementation (MVP Scope)

A. Database Schema (prisma/schema.prisma)

Add a single model to track the recap lifecycle.

model DemoRecap {
  id           String   @id @default(cuid())
  demo         Demo     @relation(fields: [demoId], references: [id], onDelete: Cascade)
  demoId       String   @unique
  aiSummary    String   @db.Text
  topQuestions Json     // ["Question 1", "Question 2", "Question 3"]
  answers      Json?    // ["Answer 1", "Answer 2", "Answer 3"]
  isSubmitted  Boolean  @default(false)
}


B. Backend Logic (tRPC)

recap.generate: Fetches feedback → Calls OpenAI → Inserts DemoRecap.

recap.submitAnswers: Updates answers & sets isSubmitted: true.

recap.sendBlast: Renders React Email template → Sends via Resend to all Attendee emails.

C. Frontend (UI)

Admin Dashboard: A simple "Quick Action" button: [⚡️ Start Recap Cycle].

Demoist View: A minimalist form at /recap/[demoId]. No complex dashboard, just 3 text areas and a "Submit" button.

5. Implementation Timeline (11.5 Hours)

To hit this aggressive target, we will rely heavily on AI code generation (Cursor/Claude) for boilerplate and shadcn/ui for pre-built components.

Phase 1: Backend & Data (4 Hours)

Focus: Get the data flowing from DB to AI and back.

Task

Detail

Time

Schema & Migration

Add DemoRecap model.

0.5h

AI Integration

Write generateSummary(feedback[]) function using Vercel AI SDK or direct OpenAI fetch.

1.5h

tRPC Routers

Create generate (Admin) and submit (Demoist) procedures.

1.5h

Mock Data

Create a seed script to fake 50 feedback comments for testing.

0.5h

Phase 2: Frontend Interfaces (4 Hours)

Focus: Functional UI over perfect design.

Task

Detail

Time

Admin Trigger

Add a button to the existing Admin panel that calls recap.generate and shows a "Success" toast.

1.0h

Demoist Form

Build the input page. Use standard shadcn Textarea and Card components. No custom CSS.

2.0h

Validation

Simple check: Ensure all 3 questions have answers before submitting.

1.0h

Phase 3: Email Engine (3.5 Hours)

Focus: Delivery and Content.

Task

Detail

Time

Email Template

Build RecapEmail.tsx. Use a simple single-column layout: Stats Header -> List of Demos (Title, Pitch, Q&A) -> Footer.

2.0h

Send Logic

Implement the bulk sending loop (fetching all attendees).

1.0h

Final Polish

Manual test run (send to self) and fix any glaring layout bugs.

0.5h

6. Success Metrics

Completion: Feature is deployed and functional on Vercel.

Reliability: AI generation works without crashing on empty feedback.

Value: Email renders correctly in Gmail and Outlook (Basic check).

7. Risks & Mitigations (MVP)

Risk: AI generates bad questions.

Mitigation: Demoists can edit the question text in the form if needed (simple update to the UI to make the question text an input field).

Risk: Email hits spam.

Mitigation: Use Resend's verified domain; keep HTML simple (text-heavy).