# Demoist Portal - Feature Design Document

## Problem Statement

Demoists (presenters) lack a self-service portal to manage their submission and access event information. Currently, after submitting a demo, demoists can only:
- Wait for email notifications about status changes
- Access their demo feedback after the event via a secret link (if they have it)
- Update demo details only if they have the secret link

This creates several problems:

**For Demoists:**
- No way to check their submission status (PENDING, WAITLISTED, CONFIRMED, REJECTED)
- Cannot update their submission details after submission
- Cannot access their demo feedback link before the event
- No visibility into event details, schedule, or presentation order
- Anxiety from waiting for email notifications
- Risk of losing secret links

**For Event Organizers:**
- Increased support requests ("What's my status?", "Can I update my info?", "I lost my link")
- Manual communication burden
- Risk of outdated demo information if demoists can't update details
- Reduced engagement due to lack of visibility

**Who experiences this problem:**
- All demoists who submit to events
- Event organizers who field support requests
- Demoists who need to update information after submission

---

## Proposed Solution

A **Demoist Portal** that provides email-based authentication and self-service access to:

1. **Submission Status Dashboard**
   - Real-time status display (PENDING, WAITLISTED, AWAITING_CONFIRMATION, CONFIRMED, REJECTED)
   - Submission details and metadata
   - Status change history/timeline

2. **Submission Management**
   - Update submission details (name, tagline, description, URL, demo URL, POC name)
   - View submission history

3. **Demo Information** (when converted)
   - Access demo feedback link
   - View demo details
   - Update demo information
   - See presentation order/index

4. **Event Information**
   - Event name, date, time
   - Event URL/venue
   - Important reminders and deadlines
   - Presentation guidelines

5. **Post-Event Access**
   - Direct access to feedback recap
   - Download feedback data

**Authentication Approach:**
- Magic link authentication via email (no password required)
- Secure, one-time-use links sent to submission email
- Session-based access after authentication
- Works for both submissions and demos (unified by email)

---

## User Stories

1. **As a demoist**, I want to check my submission status at any time, so that I know if I've been accepted, waitlisted, or rejected without waiting for email notifications.

2. **As a demoist**, I want to update my submission details (URL, description, contact info) after submitting, so that organizers have the most current information about my demo.

3. **As a demoist**, I want to access my demo feedback link before the event, so that I can share it with my team and prepare for the presentation.

4. **As a demoist**, I want to see event details and my presentation order, so that I know when and where to present.

5. **As an event organizer**, I want demoists to be able to self-serve their information, so that I receive fewer support requests and can focus on event management.

---

## Technical Approach

### Database Changes

**New Model: `DemoistSession`**
```prisma
model DemoistSession {
  id        String   @id @default(cuid())
  token     String   @unique
  email     String
  eventId   String
  expiresAt DateTime
  
  createdAt DateTime @default(now())
  
  @@index([token])
  @@index([email, eventId])
}
```

**Optional Enhancement: `SubmissionStatusHistory`** (for timeline feature)
```prisma
model SubmissionStatusHistory {
  id           String   @id @default(cuid())
  submissionId String
  status       SubmissionStatus
  changedAt    DateTime @default(now())
  changedBy    String?  // "admin" or "system"
  
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  @@index([submissionId])
}
```

**Schema Updates:**
- Add `lastStatusChangeAt` to `Submission` model (optional, for quick status change detection)
- No changes needed to existing `Submission` or `Demo` models

### API Endpoints (tRPC Routers)

**New Router: `demoist.ts`**

```typescript
demoistRouter = {
  // Authentication
  requestMagicLink: publicProcedure
    .input(z.object({ email: z.string().email(), eventId: z.string() }))
    .mutation(...) // Send magic link email
  
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(...) // Verify token and return session info
  
  // Submission access
  getMySubmission: publicProcedure
    .input(z.object({ eventId: z.string(), email: z.string().email() }))
    .query(...) // Get submission by email + eventId
  
  updateMySubmission: publicProcedure
    .input(z.object({ 
      submissionId: z.string(),
      email: z.string().email(),
      // ... update fields
    }))
    .mutation(...) // Update submission (with email verification)
  
  // Demo access
  getMyDemo: publicProcedure
    .input(z.object({ eventId: z.string(), email: z.string().email() }))
    .query(...) // Get demo by matching email to demo.email
  
  // Event info
  getEventInfo: publicProcedure
    .input(z.string())
    .query(...) // Get public event info
}
```

**Updates to existing routers:**
- `submission.ts`: Add email-based lookup endpoints (if not already present)
- `demo.ts`: Add email-based lookup for demo by eventId + email

### UI Components

**New Pages:**
- `/demoist/[eventId]` - Landing page (email input)
- `/demoist/[eventId]/portal` - Main portal dashboard (after auth)
- `/demoist/[eventId]/portal/submission` - Submission management
- `/demoist/[eventId]/portal/demo` - Demo information (when available)

**New Components:**
- `DemoistAuth.tsx` - Magic link request form
- `DemoistPortal.tsx` - Main dashboard
- `SubmissionStatusCard.tsx` - Status display with timeline
- `SubmissionEditForm.tsx` - Editable submission form
- `DemoInfoCard.tsx` - Demo details and feedback link
- `EventInfoCard.tsx` - Event details display

**Component Location:**
- `/src/app/(demoist-portal)/[eventId]/` - New route group
- `/src/components/demoist/` - Reusable demoist components

### Email Templates

**New Template: `getMagicLinkTemplate`**
- Magic link for portal access
- Event context
- Security notice
- Link expiration (24 hours)

**Integration:**
- Add to `src/lib/email.ts`
- Use existing Resend setup
- Include link: `https://demos.aicollective.com/demoist/[eventId]?token=[token]`

### Security Considerations

1. **Magic link tokens:**
   - Cryptographically secure random tokens (cuid or similar)
   - 24-hour expiration
   - Single-use (delete after verification)
   - Rate limiting on request endpoint

2. **Email verification:**
   - All mutations verify email matches submission/demo email
   - Prevent email enumeration (generic error messages)

3. **Access control:**
   - Portal only shows data for authenticated email
   - No cross-event data access
   - Session-based authentication after magic link

---

## Implementation Plan

### Phase 1: Core Authentication & Basic Portal (Week 1-2)

**Step 1.1: Database Schema** (2-3 hours)
- Add `DemoistSession` model to Prisma schema
- Create and run migration
- Update seed data if needed

**Step 1.2: Magic Link Authentication** (4-6 hours)
- Create `demoist.ts` tRPC router
- Implement `requestMagicLink` mutation
- Implement `verifyToken` query
- Create email template for magic links
- Add email sending logic

**Step 1.3: Basic Portal UI** (6-8 hours)
- Create `(demoist-portal)` route group
- Build email input landing page
- Build token verification flow
- Create basic portal dashboard layout
- Add session management (cookies/localStorage)

**Deliverable:** Demoists can request and use magic links to access a basic portal

### Phase 2: Submission Management (Week 2-3)

**Step 2.1: Submission Lookup & Display** (3-4 hours)
- Add `getMySubmission` endpoint
- Create submission status display component
- Add submission details card
- Handle "no submission found" state

**Step 2.2: Submission Updates** (4-5 hours)
- Add `updateMySubmission` endpoint with email verification
- Create editable submission form
- Add validation and error handling
- Show success/error feedback

**Step 2.3: Status Timeline** (3-4 hours)
- Add status history tracking (optional enhancement)
- Create timeline component
- Display status changes with timestamps

**Deliverable:** Demoists can view and update their submission information

### Phase 3: Demo Integration (Week 3-4)

**Step 3.1: Demo Lookup** (2-3 hours)
- Add `getMyDemo` endpoint (match by email + eventId)
- Create demo info display component
- Show demo feedback link prominently
- Display presentation order/index

**Step 3.2: Demo Updates** (3-4 hours)
- Reuse existing demo update endpoint (with email verification)
- Create demo edit form in portal
- Link to existing demo feedback page

**Step 3.3: Unified View** (2-3 hours)
- Show both submission and demo info when available
- Clear status progression (Submission → Demo)
- Handle edge cases (demo without submission, etc.)

**Deliverable:** Demoists can access demo information and feedback links

### Phase 4: Event Information & Polish (Week 4-5)

**Step 4.1: Event Info Display** (2-3 hours)
- Add event details card
- Show event date, time, venue/URL
- Display important deadlines
- Link to event guidelines

**Step 4.2: UI/UX Polish** (4-6 hours)
- Improve visual design consistency
- Add loading states and skeletons
- Improve error messages
- Add helpful tooltips and guidance
- Mobile responsiveness

**Step 4.3: Email Integration** (2-3 hours)
- Update existing status update emails to include portal link
- Add portal link to submission confirmation email
- Update email templates with portal CTA

**Deliverable:** Complete, polished demoist portal experience

### Phase 5: Testing & Documentation (Week 5)

**Step 5.1: Testing** (4-6 hours)
- Test magic link flow (expiration, single-use)
- Test submission updates
- Test demo access
- Test edge cases (multiple submissions, no demo, etc.)
- Security testing (email verification, access control)

**Step 5.2: Documentation** (2-3 hours)
- Update README with portal information
- Add admin documentation for portal links
- Create user-facing help/FAQ

**Total Estimated Time:** 40-55 hours (5-7 weeks for one developer)

---

## Success Metrics

### Primary Metrics

1. **Portal Adoption Rate**
   - Target: 60%+ of demoists access portal within 7 days of submission
   - Measure: Unique portal sessions / total submissions

2. **Support Request Reduction**
   - Target: 40% reduction in status/info-related support requests
   - Measure: Count support tickets before/after launch

3. **Submission Update Rate**
   - Target: 20%+ of demoists update their submission via portal
   - Measure: Submission updates via portal / total submissions

### Secondary Metrics

4. **Time to First Portal Access**
   - Average time from submission to first portal login
   - Target: < 24 hours

5. **Portal Return Rate**
   - Percentage of demoists who return to portal multiple times
   - Target: 30%+ return within 7 days

6. **Email Click-Through Rate**
   - Clicks on portal links in emails
   - Target: 25%+ CTR on magic link emails

7. **Demo Feedback Link Access**
   - Percentage of demoists who access feedback link before event
   - Target: 50%+ access link before event date

### Qualitative Metrics

- User feedback surveys (post-event)
- Admin feedback on support burden reduction
- Feature requests and enhancement ideas

---

## Potential Challenges & Mitigations

### Challenge 1: Email Delivery Issues
**Problem:** Magic links may not be delivered (spam, wrong email, etc.)

**Mitigation:**
- Use existing Resend infrastructure (already proven)
- Clear instructions in submission confirmation email
- Support fallback: admins can manually send portal links
- Display email address confirmation on submission form

### Challenge 2: Security Concerns
**Problem:** Magic links could be intercepted or shared inappropriately

**Mitigation:**
- Short expiration (24 hours)
- Single-use tokens (delete after verification)
- Rate limiting on magic link requests
- Session-based auth after initial verification
- Clear security messaging in emails

### Challenge 3: Email Matching Complexity
**Problem:** Submissions and demos may have different emails, or emails may change

**Mitigation:**
- Primary lookup: match by submission email
- Secondary lookup: match demo.email if submission not found
- Allow admins to manually link accounts if needed
- Clear error messages if no match found

### Challenge 4: User Confusion
**Problem:** Demoists may not understand the portal or how to use it

**Mitigation:**
- Clear onboarding flow with tooltips
- Prominent links in all email communications
- Help documentation and FAQ
- Simple, intuitive UI following existing app patterns

### Challenge 5: Performance at Scale
**Problem:** Many demoists accessing portal simultaneously could cause load

**Mitigation:**
- Use existing database indexes
- Cache event information
- Optimize queries (only fetch needed data)
- Monitor and scale as needed (existing infrastructure should handle)

### Challenge 6: Maintaining Existing Flows
**Problem:** Portal shouldn't break existing secret link flows

**Mitigation:**
- Portal is additive, not replacement
- Secret links continue to work
- Portal provides alternative access method
- Both methods can coexist

---

## Future Enhancements (Out of Scope)

1. Multi-event dashboard (view all submissions across events)
2. Submission draft saving
3. Real-time status notifications (WebSocket/push)
4. Demoist profile pages
5. Integration with calendar (iCal export for event dates)
6. Pre-event checklist/reminders
7. Demoist community features

---

## Conclusion

The Demoist Portal addresses a clear gap: demoists lack self-service access to their submission and demo information. By providing email-based authentication and a unified portal, we reduce support burden, improve demoist experience, and increase engagement. The implementation is feasible within the existing architecture and follows established patterns in the codebase.

The feature directly addresses real user needs identified through codebase analysis and provides measurable value to both demoists and event organizers.

