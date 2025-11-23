# Demo Night App - Take Home Assignment

Welcome! This take-home assignment is designed to assess your full-stack development skills using the T3 Stack (Next.js, tRPC, Prisma, TypeScript) in a real production codebase.

## Overview

You'll be working on the Demo Night App, a Next.js application for managing demo night events (see example event recap). You'll complete three tasks that cover different aspects of full-stack development:

- Chapter Management — Build a complete feature to organize events by chapter
- Email Integration — Add email notifications with Resend
- Feature Proposal — Research and propose a new feature with product documentation

## Expectations

- Time commitment: 10–15 hours total
- Submission deadline: Sunday, November 23rd at 11:59pm PT
- AI agent use: REQUIRED (Claude Code, Codex, Cursor, etc.)
- Code quality: Production-ready, well-tested, properly typed
- Git hygiene: Clear commit messages, logical commits
- Documentation: Update relevant files as needed

Note: This assignment is intentionally open-ended in places. We operate in a high-agency, high-velocity environment where engineers are expected to make sound technical decisions, ask clarifying questions when needed, and ship features end-to-end. This assignment mirrors that reality!

## Setup

1. Fork the repository (demo-night-app) to your personal GitHub account
2. Clone your fork locally
3. Follow setup instructions in README.md and CLAUDE.md
4. Create a new git branch for your work

### Quick start

```
yarn install
yarn global add dotenv-cli
./start-database.sh
yarn db:push
yarn db:seed
yarn dev
```

## Tasks

Complete all three tasks below. Each task builds on realistic feature requests you might encounter in production.

### 1️⃣ Chapter Management System

**Background:** Demo Night App is used by multiple chapters (SF, NYC, Boston, etc.). Currently, there's no way to organize events by chapter. Let's add this organizational layer.

**Requirements:**
- Add a new `Chapter` model to the Prisma schema
- Each chapter has: `name` (string), `emoji` (string for icon), `events` (relation)
- Update `Event` model to optionally belong to a chapter (nullable `chapterId`)
- Create a tRPC router with CRUD operations for chapters
- Build a UI to create, edit, and delete chapters
- You decide: dedicated `/admin/chapters` page, or inline on admin home, or another approach
- Add chapter selector to the event creation/edit modal
- Add chapter filter to admin home page to filter events by chapter
- Display chapter emoji/name throughout the app where events are shown
- Handle edge cases (what happens when a chapter is deleted? You decide and implement)

**Success criteria:**
- ✅ Database migration creates Chapter table with proper relations
- ✅ Admin can create/edit/delete chapters through UI
- ✅ Admin can assign chapters to events (both new and existing)
- ✅ Admin home page shows chapter information and allows filtering by chapter
- ✅ Chapter deletion is handled gracefully (your chosen approach)
- ✅ Chapter emojis display correctly throughout UI
- ✅ TypeScript types updated throughout codebase
- ✅ No runtime errors or TypeScript errors

**Files you'll likely modify:**
- `prisma/schema.prisma`
- `src/server/api/routers/` (create new `chapter.ts`)
- `src/server/api/root.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/components/UpsertEventModal.tsx`
- Create Chapter management UI components

**Time estimate:** 5–6 hours

### 2️⃣ Email Notifications with Resend

**Background:** When someone submits a demo, they currently receive no confirmation. When admins approve/reject submissions, submitters aren't notified. Let's fix this with email notifications.

**Requirements:**
- Set up Resend integration (API key in `.env`)
- Create email templates for:
  - Submission confirmation (sent immediately when demo is submitted)
  - Submission status updates (when status changes to `CONFIRMED` or `REJECTED`)
- Send emails at appropriate points in the submission flow
- Include relevant information (event name, demo title, next steps)
- Handle errors gracefully with proper logging
- Add email preview in development mode (optional but impressive)

**Success criteria:**
- ✅ Environment variables properly configured
- ✅ Emails sent when demo submission is created
- ✅ Emails sent when submission status changes to `CONFIRMED` or `REJECTED`
- ✅ Email templates are well-designed
- ✅ Email content is personalized with submission details

**Files you'll likely modify:**
- `src/env.js` (add Resend API key)
- `src/server/api/routers/submission.ts`
- Create new: `src/lib/email.ts` or similar
- Create new: `src/emails/` directory for templates

**Resources:**
- Resend Documentation
- React Email (recommended for templates)

**Time estimate:** 2–3 hours

### 2️⃣ Feature Proposal — PRD

**Background:** After working with Demo Night App and understanding its architecture, we want you to think like a product engineer. Identify a feature that would add real value to event organizers or attendees.

**Requirements:**
- Spend time exploring the codebase and using the app (admin dashboard, submission process, attendee experience)
- Identify a real user need or pain point
- Write a design document that includes:
  - Problem statement: What problem are you solving? Who experiences this problem?
  - Proposed solution: How would you solve it?
  - User stories: 3–5 user stories in standard format
  - Technical approach: Database changes, API endpoints, UI components needed
  - Implementation plan: Break down into steps with time estimates
  - Success metrics: How would you measure if this feature is successful?
  - Identify potential challenges and how you'd mitigate them

**Success criteria:**
- ✅ Clear problem articulation with evidence or reasoning
- ✅ Proposed solution directly addresses the problem
- ✅ Technical design is feasible within the existing architecture
- ✅ User stories follow standard format ("As a [role], I want [goal], so that [benefit]")
- ✅ Implementation plan is realistic and considers existing patterns
- ✅ Shows deep understanding of the codebase and user needs

**Deliverable:**
- Design document (2–4 pages, Markdown or PDF)
- 3–5 minute section in your Loom video explaining your proposal

**Example features to consider (please propose your own!):**
- AI grader for demo submissions
- Analytics dashboard with cross-event insights and trends
- Add a new type of audience voting
- Slack / Discord integration for event notifications

**Time estimate:** 2–3 hours

## Submission

**Deadline:** Sunday, November 23rd at 11:59pm PT

Submit the following:
- GitHub repo
  - Link to your forked repository
  - Ensure all commits are pushed to your branch
  - Create a PR from your branch to main (don't merge)
- Deployed app (highly encouraged)
  - Deploy to Vercel (free tier is fine)
  - Include live URL in your submission
  - Brownie points for working demo with test data
- Loom / video recording (10–20 minutes)
  - Walk through your implementation for each task
  - Demonstrate features working (via screen share)
  - Show your development process, including AI agent usage
  - Explain key technical decisions
  - Discuss challenges and how you solved them
  - Walk through your feature proposal (task 3)

## Evaluation Criteria

We'll evaluate your submission on:
- Functionality: Does it work as specified?
- Code quality: Is it clean, typed, and maintainable?
- Problem solving: How did you approach challenges and ambiguity?
- Product Thinking: Does your feature proposal show user empathy and system thinking?
- Communication: Can you clearly explain your work and decisions?

## Tips

- Read the docs: `CLAUDE.md` has project-specific guidance and common patterns
- Use AI agents effectively: We want to see you leverage modern tools — show this in your Loom
- Make decisions: When requirements are ambiguous, make a reasonable choice and document why
- Test thoroughly: Test happy paths, edge cases, and error states
- Deploy early: Don't wait until the end — deploy and iterate
- Commit frequently: Clear, atomic commits with descriptive messages
- Ask questions: If truly blocked on something critical, note it in your Loom
- Scope appropriately: It's okay if you don't finish everything — focus on quality over quantity
- Think like a PM: For Task 3, put yourself in the user's shoes
- Early submission gets brownie points!

## Questions?

If you have questions about the assignment:
- Check the existing documentation first (`README.md`, `CLAUDE.md`)
- Review the codebase for patterns and examples
- Make a reasonable assumption and document it
- If truly blocked, email chappy@aicollective.com

Note: Part of this assignment is assessing your ability to work with ambiguity and make sound technical decisions, which is a core part of our engineering culture. When in doubt, document your reasoning.

Good luck! We're excited to see what you build and how you think! 🚀


## About the company:
AI Collective is a global non-profit community aligning AI with human values.

Summary: AI Collective is a global, grassroots non-profit community (formerly GenAI Collective) with 70,000+ members across 25+ chapters, partnering with organizations like AWS, Meta, Anthropic, Roam, Product Hunt. It convenes builders, researchers, policymakers, and operators through chapters, demo nights, and flagship events to steward AI’s development toward trust and human flourishing. ​⁠https://www.businesswire.com/news/home/20250605562920/en/The-AI-Collective-Launches-Globally-to-Mobilize-Next-Generation-of-AI-Innovators-and-Stewards

Mission: Make AI trustworthy, open, and human‑centric, rebuilding societal trust and fostering collaboration so AI progress stays aligned with human values and benefits all. ​⁠https://www.businesswire.com/news/home/20250605562920/en/The-AI-Collective-Launches-Globally-to-Mobilize-Next-Generation-of-AI-Innovators-and-Stewards

Goals:

- Expand global chapters and in‑person community to deepen collaboration and trust (salons, hackathons, demo nights; culminating at Singularity Fest in November 2025, San Francisco). ​⁠https://www.businesswire.com/news/home/20250605562920/en/The-AI-Collective-Launches-Globally-to-Mobilize-Next-Generation-of-AI-Innovators-and-Stewards

- Inform decision‑makers via the AI Collective Institute with open research bridging frontier insights and responsible governance. ​⁠https://www.businesswire.com/news/home/20250605562920/en/The-AI-Collective-Launches-Globally-to-Mobilize-Next-Generation-of-AI-Innovators-and-Stewards

- Support mission‑aligned founders through Collective Investments, connecting trustworthy, beneficial AI with values‑aligned capital. ​⁠https://www.businesswire.com/news/home/20250605562920/en/The-AI-Collective-Launches-Globally-to-Mobilize-Next-Generation-of-AI-Innovators-and-Stewards

Founders/Leaders: Public statements reference Chappy Asel, Co‑Founder and Executive Director. ​⁠https://www.businesswire.com/news/home/20250605562920/en/The-AI-Collective-Launches-Globally-to-Mobilize-Next-Generation-of-AI-Innovators-and-Stewards

Origins and adjacent initiative: A separate healthcare‑focused site describes an AI education roadmap for pharmacists (by Whitley and Christy) aiming to make AI accessible in healthcare; this appears distinct from the global non‑profit above and is focused on pharmacist education. ​⁠https://www.aicollective.co/ ​⁠https://www.aicollective.co/about

Note: The global non‑profit branding, scale metrics, and initiatives come from June 2025 launch coverage. ​⁠https://finance.yahoo.com/news/ai-collective-launches-globally-mobilize-160000088.html