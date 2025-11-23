# Demo Night App - Founding Engineer Take-Home Assignment

**Role:** Founding Engineer Candidate  
**Estimated Time:** 10–15 Hours  
**Deadline:** Sunday, November 23rd at 11:59 PM PT  
**Tech Stack:** T3 Stack (Next.js App Router, TypeScript, Tailwind CSS, Prisma, tRPC, Resend)

---

## 1. Project Overview
The "Demo Night App" is an open-source platform used to manage community demo events. Currently, the application operates as a single-location instance. Your goal is to refactor the system to support multiple geographic "Chapters," add email automation, and demonstrate product thinking.

---

## 📊 Completion Status

**Overall Status:** ✅ **100% COMPLETE + BONUS FEATURES**

| Feature | Status | Completion |
|---------|--------|------------|
| Feature 1: Chapter Management System | ✅ Complete | 100% |
| Feature 2: Email Notifications | ✅ Complete | 100% |
| Feature 3: Product Proposal (PRD) | ✅ Complete | 100% |
| **BONUS: Predictions & Leaderboard** | ✅ Complete | **100%** |

**Summary:**
- All 3 required features fully implemented and tested
- Database migrations created and applied
- Email system working with professional templates
- Comprehensive product proposal documented in `FEATURE_PROPOSAL.md`
- **Bonus:** Proposed Predictions feature fully built from database to UI
- Code follows T3 Stack patterns with full type safety
- Admin dashboard enhanced with chapter management and filtering

---

## 2. Core Tasks

### Feature 1: Chapter Management System
**Objective:** Refactor the data model and UI to support multiple city locations (e.g., San Francisco, New York, London).

#### 2.1 Database (Prisma)
Modify `prisma/schema.prisma`:
- [x] **Create `Chapter` Model:**
  - `id`: Unique Identifier (String/Cuid or Int).
  - `name`: City Name (e.g., "San Francisco").
  - `slug`: URL-friendly ID (e.g., "sf").
  - `createdAt` / `updatedAt`.
  - **Note:** Initially created with `emoji` field, then migrated to `slug` in migration `20251121010000_replace_emoji_with_slug`.
- [x] **Update `Event` Model:**
  - Add `chapterId` as a Foreign Key.
  - Establish a One-to-Many relationship (One Chapter -> Many Events).
- [x] **Migration:** Run `npx prisma migrate dev` to apply changes.
  - **Created:** `20251121000000_add_chapter_model/` and `20251121010000_replace_emoji_with_slug/`

#### 2.2 Backend (tRPC)
- [x] **Create Router (`src/server/api/routers/chapter.ts`):**
  - `create`: Procedure to add a new chapter.
  - `getAll`: Procedure to list all chapters (for UI selection).
  - **Bonus:** Also implemented `getById`, `update`, and `delete` procedures.
- [x] **Update Event Router:**
  - Modify `event.create` to accept and validate `chapterId` via Zod.
  - **Implemented:** `event.upsert` and `event.allAdmin` support chapter filtering.

#### 2.3 Frontend (Admin Dashboard)
- [x] **Chapter Management View:**
  - Create a UI in the Admin Dashboard to view a list of chapters.
  - Add a form/modal to **Create a Chapter** (inputs: Name, Slug).
  - **Implemented:** `src/app/admin/components/ChapterManagement.tsx` with full CRUD operations.
  - **Features:** Event count display, delete warnings, Edit/Delete modals.
- [x] **Event Creation Flow:**
  - Update the "Create Event" form.
  - Add a `<Select>` dropdown to choose a **Chapter** when creating an event.
  - **Implemented:** Chapter selection in `src/app/admin/components/UpsertEventModal.tsx`.
  - **Bonus:** Chapter filter dropdown in main Admin Dashboard (`src/app/admin/page.tsx`).

---

### Feature 2: Email Notifications
**Objective:** Automate communication using the Resend API to keep users informed about their submission status.

#### 2.1 Configuration
- [x] Sign up for [Resend](https://resend.com) (Free Tier).
- [x] Generate an API Key.
- [x] Add `RESEND_API_KEY` to your `.env` file.
  - **Implemented:** Added to `.env.example` and validated in `src/env.js`.

#### 2.2 Implementation
- [x] **Trigger 1: Submission Confirmation**
  - **When:** A user successfully submits the "Submit Demo" form.
  - **Action:** Send an email to the applicant confirming receipt.
  - **Implemented:** Email sent via `submission.create` in `src/server/api/routers/submission.ts`.
  - **Template:** `src/emails/SubmissionConfirmation.tsx` with professional styling.
  - **Service:** Email service in `src/lib/email.tsx` with graceful error handling.
- [x] **Trigger 2: Status Update**
  - **When:** An Admin updates a submission status (Pending → Accepted/Rejected).
  - **Action:** Send a specific email notification based on the new status.
    - *Accepted:* "Congratulations, you are in!"
    - *Rejected:* "Unfortunately, we couldn't fit you in."
  - **Implemented:** Status change detection in `submission.adminUpdate` endpoint.
  - **Templates:** `src/emails/SubmissionApproved.tsx` and `src/emails/SubmissionRejected.tsx`.
  - **Note:** All email sending is non-blocking to prevent submission failures.

---

### Feature 3: Product Proposal (PRD)
**Objective:** Demonstrate product sense, empathy, and system thinking.

- [x] **Draft a Document:** Create `FEATURE_PROPOSAL.md` (or a Notion link).
  - **Created:** `FEATURE_PROPOSAL.md` with comprehensive feature specification.
- [x] **Identify a Gap:** Find one missing feature that would add high value to the community.
  - **Identified:** Predictions & Leaderboard System for increased attendee engagement.
- [x] **Write the Spec:**
  - **Problem:** What user pain point is being solved?
    - Low engagement during events, lack of gamification, limited interaction with demos.
  - **Solution:** High-level technical and functional description.
    - Budget-based prediction system ($100k per award), accuracy scoring, public leaderboard with badges.
  - **Justification:** Why is this the priority?
    - Increases attendee engagement, creates viral social sharing, provides market insights for companies.
  - **Bonus:** This feature was fully implemented (see Feature 4 below)!

---

### Feature 4: Predictions & Leaderboard System (BONUS)
**Status:** ✅ FULLY IMPLEMENTED (Beyond Requirements)

This feature was proposed in `FEATURE_PROPOSAL.md` and has been completely built from end-to-end.

#### 4.1 Database (Prisma)
- [x] **Created `Prediction` Model:**
  - Links attendees to demos with budget allocations per award category
  - Tracks predictions during the Predictions phase
  - Validates $100k budget constraint per award
- [x] **Created `PredictionScore` Model:**
  - Stores accuracy scores after event concludes
  - Calculates badge levels (Oracle 🔮, Gold 🥇, Silver 🥈, Bronze 🥉, Novice 🎱)
  - Tracks overall accuracy and total events participated

#### 4.2 Backend (tRPC)
- [x] **Created Prediction Router (`src/server/api/routers/prediction.ts`):**
  - `all` - Get all predictions for an attendee
  - `upsert` - Create/update predictions with budget validation
  - `getConsensusPredictions` - Aggregate community predictions by demo
  - `calculateAccuracy` - Admin-only endpoint to calculate scores after event
  - `getLeaderboard` - Ranked leaderboard with top predictors
  - `getMyStats` - Individual attendee prediction statistics
  - `delete` - Remove predictions
- [x] **Phase Validation:**
  - Predictions locked to "Predictions" phase only
  - Real-time budget validation ($100k per award)
  - Prevents editing after phase ends

#### 4.3 Frontend (Attendee UI)
- [x] **PredictionsWorkspace Component (`src/app/(attendee)/components/PredictionsWorkspace/`):**
  - Beautiful drag-and-drop budget allocation interface
  - Real-time budget validation with visual feedback
  - Award category tabs (Best Overall, Funniest, Most Innovative, etc.)
  - Custom hooks: `usePredictions`, `usePredictionActions`, `useConsensusPredictions`
  - Budget sliders and demo selection UI
- [x] **PredictionLeaderboard Component (`src/app/(attendee)/components/RecapWorkspace/PredictionLeaderboard.tsx`):**
  - Top 5 predictors display with badge emojis
  - User's personal rank and accuracy stats
  - Integration with RecapWorkspace for post-event viewing
- [x] **Admin Controls:**
  - "Calculate Accuracy" button in Control Center
  - Triggers scoring after winners are announced

#### 4.4 Key Features
- **Budget-Based Predictions:** Attendees allocate $100k per award across demos
- **Accuracy Scoring:** Sophisticated algorithm measuring prediction accuracy
- **Badge System:** 5 levels of achievement (Oracle, Gold, Silver, Bronze, Novice)
- **Social Gamification:** Public leaderboard encourages engagement
- **Market Insights:** Consensus predictions show community sentiment
- **Phase-Locked:** Only available during designated prediction window

---

## 3. Evaluation Criteria

### Functional
- Does the "Chapter" feature work end-to-end?
- Do emails send correctly upon trigger events?
- Is the app deployed and accessible?

### Technical
- **Type Safety:** Strict TypeScript usage (no `any`).
- **Code Structure:** Modular components, clean tRPC routers.
- **Git Hygiene:** Clear commit messages, feature branches (do not push directly to `main`).

---

## 4. Submission Requirements

To complete the assignment, submit the following:

1.  **GitHub Repository:** A link to your forked public repo.
2.  **Deployed App:** A live link to the app hosted on Vercel (ensure Environment Variables are set in Vercel Dashboard).
3.  **Loom Video (10–20 mins):**
    - **Demo:** Walk through creating a chapter, creating an event, submitting a demo, and receiving the email.
    - **Code Review:** Briefly explain your schema changes and tRPC implementation.
    - **Product:** Summarize your Feature Proposal.

> **Tip:** Focus on speed and "agency." If you get stuck on a minor detail, make a reasonable assumption, document it, and keep moving.