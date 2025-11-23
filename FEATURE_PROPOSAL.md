# Product Requirements Document (PRD)

## The Day-After Digest (MVP) 📧

---

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | The Day-After Digest |
| **Target Audience** | Event Attendees, Demo Presenters, Event Organizers |
| **Status** | Proposed |
| **Estimated Effort** | 11.5 Hours (MVP Scope) |
| **Priority** | High |
| **Complexity** | Medium |

---

## 1. Problem Statement

### The "Post-Event Drop-off" 

Live events suffer from a sharp decline in engagement the moment the venue doors close.

**Key Pain Points:**

- **Attendees** leave inspired but often forget to exchange contact details or miss answers to questions due to venue noise. They lack a structured way to "reconnect" with the demos they loved.

- **Demoists** receive raw, unstructured feedback (e.g., "Good job!") that is hard to act on. They miss the opportunity to address burning questions from investors or users who were too shy to ask live.

- **Organizers** rarely send detailed event recaps because manually collecting photos, summarizing stats, and curating links is operationally heavy.

### Impact

-  Lost networking opportunities
-  Unresolved investor questions
-  Low follow-up engagement (typically < 20% in manual recap scenarios)
-  Heavy operational burden on organizers

---

## 2. Proposed Solution

### The "Smart Recap" Workflow 

An automated, two-stage workflow that leverages the AI Collective's brand identity (AI-driven insights) to close the loop on community connection.

#### **Stage 1: The Input Loop** 
**Immediately after the event:**

1. AI agent aggregates raw feedback comments from attendees
2. Synthesizes a "Sentiment Summary" for the presenter
3. Extracts the "Top 3 Unanswered Questions"
4. Presenter receives a **private email** prompting them to answer within 24 hours

#### **Stage 2: The Output Loop** 
**After the 24-hour window closes:**

1. System generates a single, high-signal **"Day-After Digest" email**
2. Sent to **all attendees** (exclusive for event subscribers only)
3. Replaces generic "Thanks for coming" blast with exclusive value:
   - Q&A answers from founders
   - Direct "Connect" links
   - Demo rankings/highlights

### Key Constraint: Email-Only Distribution 

To maximize exclusivity and open rates, this recap is **Email Only**. There is no public web archive. You have to be on the list to get the alpha.

---

## 3. User Stories

| Role | User Story | Acceptance Criteria |
|------|------------|-------------------|
| **Demoist** | As a presenter, I want to see my feedback so I can understand my strengths/weaknesses without reading 50 raw comments. | See AI-generated summary of sentiment + key themes |
| **Demoist** | As a presenter, I want to answer specific questions I missed live so I can clarify my product's value to interested investors. |  Receive top 3 questions + 24-hour window to respond |
| **Attendee** | As an attendee, I want to receive a list of the demos with their contact info the next day so I can follow up with the ones I liked. |  Get demo details + founder answers in email next day |
| **Organizer** | As an admin, I want to click one button to generate a professional event recap so I can save hours of manual administrative work. |  Click [Start Recap] button → automatic workflow starts |

---

## 4. Technical Implementation (MVP Scope)

### A. Database Schema

**New Model: `DemoRecap`**

```prisma
model DemoRecap {
  id           String   @id @default(cuid())
  event        Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId      String
  demo         Demo     @relation(fields: [demoId], references: [id], onDelete: Cascade)
  demoId       String   @unique
  
  // AI-generated summary
  aiSummary    String   @db.Text
  sentiment    String   // "positive" | "neutral" | "critical"
  
  // Top questions extracted
  topQuestions Json     // ["Question 1", "Question 2", "Question 3"]
  
  // Presenter answers (optional until submitted)
  answers      Json?    // ["Answer 1", "Answer 2", "Answer 3"]
  isSubmitted  Boolean  @default(false)
  
  // Status tracking
  generatedAt  DateTime @default(now())
  submittedAt  DateTime?
  sentAt       DateTime?
  
  @@index([eventId])
  @@index([demoId])
}

model EventFeedback {
  // ... existing fields ...
  demoRecap    DemoRecap?
}
```

### B. Backend Logic (tRPC)

**New Router: `recap.ts`**

```typescript
// Procedures:
recap.generate(eventId) 
  // Admin only
  // Fetches all EventFeedback for event
  // Calls OpenAI API to generate summary + top 3 questions
  // Creates DemoRecap record

recap.submitAnswers(demoRecapId, answers)
  // Demoist only
  // Updates answers and sets isSubmitted: true
  // Sends acknowledgment email

recap.sendBlast(eventId)
  // Admin only
  // Checks all DemoRecaps are submitted
  // Renders RecapEmail.tsx for each attendee
  // Bulk sends via Resend
```

### C. Frontend (UI)

**Admin Dashboard Enhancement:**
- Add "Quick Actions" section
- Button: `[⚡️ Start Recap Cycle]` 
- Shows status of current recap (generating → sent)

**Demoist View: `/recap/[demoId]`**
- Simple form: 3 textarea fields for 3 answers
- Shows AI-generated questions (read-only, initially)
- "Submit Answers" button
- Success toast on submission

---

## 5. Implementation Timeline

### **Total: 11.5 Hours (MVP)**

We will rely on AI code generation (Cursor/Claude) for boilerplate and shadcn/ui for pre-built components.

### Phase 1: Backend & Data (4 Hours) 🗄️

| Task | Detail | Time |
|------|--------|------|
| **Schema & Migration** | Add DemoRecap model to schema.prisma | 0.5h |
| **AI Integration** | Write `generateSummary(feedback[])` using Vercel AI SDK or direct OpenAI fetch | 1.5h |
| **tRPC Routers** | Create `generate`, `submitAnswers`, `sendBlast` procedures | 1.5h |
| **Mock Data** | Create seed script with 50 fake feedback comments for testing | 0.5h |

### Phase 2: Frontend Interfaces (4 Hours) 🎨

| Task | Detail | Time |
|------|--------|------|
| **Admin Trigger** | Add button to Admin panel that calls `recap.generate` + shows success toast | 1.0h |
| **Demoist Form** | Build `/recap/[demoId]` page with shadcn Textarea + Card components | 2.0h |
| **Validation** | Ensure all 3 answers have content before submitting | 1.0h |

### Phase 3: Email Engine (3.5 Hours) 📧

| Task | Detail | Time |
|------|--------|------|
| **Email Template** | Build `RecapEmail.tsx` with single-column layout: Stats → Demos → Q&A → Footer | 2.0h |
| **Send Logic** | Implement bulk sending loop (fetches all attendees, sends recap) | 1.0h |
| **Polish** | Manual test run (send to self) + fix layout bugs in Gmail/Outlook | 0.5h |

---

## 6. Success Metrics ✅

| Metric | Target | How We Measure |
|--------|--------|-----------------|
| **Completion** | Feature deployed and functional on Vercel | Pull request merged + staging URL works |
| **Reliability** | AI generation works without crashing on empty feedback | Test with 0, 1, 50+ feedback items |
| **Email Quality** | Renders correctly in Gmail, Outlook, Apple Mail | Manual test sends |
| **User Adoption** | Organizer uses recap feature within first week | Admin panel usage logs |

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Email hits spam** | Low open rates, feature perceived as failure | Use Resend's verified domain; keep HTML simple (text-heavy) |
| **No feedback on demo** | AI summary fails or returns null | Fallback: Show fallback message "No attendee feedback yet" |
| **Performance issues** | Timeout on bulk email send | Implement queuing (Bull/Inngest) for batch sending |
| **Missing attendee emails** | Recap can't be sent if no attendees signed up | Graceful error: Admin sees "No attendees to send to" |

---

## 8. Future Enhancements (Post-MVP)

-  Add video clips of demos to recap email
-  Include analytics (vote counts, highest-rated demos)
-  Attendee comments on founder answers
-  Sentiment-based demo rankings

---

## 9. Glossary

| Term | Definition |
|------|-----------|
| **DemoRecap** | Database record tracking one demo's feedback summary + presenter answers for an event |
| **Sentiment Summary** | AI-generated high-level tone/vibe of feedback (positive/neutral/critical) |
| **Top 3 Unanswered Questions** | AI-extracted questions that came up in feedback but weren't answered live |
| **Demoist** | A person who presents a demo at an event |
| **Day-After Digest** | The recap email sent 24+ hours after an event with curated insights |

---

**Document Version:** 1.0  
**Last Updated:** November 22, 2025  
**Author:** Rohit Nagotkar  
**Status:** Ready for Implementation
