# Feature Proposal: Demo Presenter Dashboard

## Executive Summary

**Feature**: Post-Event Dashboard for Demo Presenters  
**Problem**: Presenters get zero follow-up after their demo. They don't know who was interested, what feedback they received, or how they can improve.  
**Solution**: Give each presenter a personalized dashboard showing their demo performance, interested attendees, and actionable feedback.  
**Value**: Increases presenter satisfaction, enables follow-ups, and encourages repeat participation.

---

## The Problem

### Current State
After presenting at a demo night, presenters are left in the dark:
- **No feedback loop**: They presented, voting happened, but they never learn what attendees thought
- **Lost connections**: Attendees clicked "Tell Me More" or quick actions (invest, hire, partner), but presenters can't follow up
- **No improvement path**: Without knowing what resonated (or didn't), presenters can't improve for future events
- **Black box experience**: The only thing they see is if they won an award—everything else is invisible

### Evidence from Codebase
Looking at the current system:
- ✅ Rich feedback data exists: ratings, claps, comments, "Tell Me More", quick actions
- ✅ Attendee contact info is captured (email, LinkedIn)  
- ❌ No presenter-facing interface to access this data
- ❌ Presenters only get a demo secret URL to update their info, nothing else

### Who This Affects
**Primary**: Demo presenters (10-15 per event)
- Spent time preparing and presenting
- Want to know if their demo resonated
- Need to follow up with interested attendees

**Secondary**: Attendees who showed interest
- Clicked "Tell Me More" expecting follow-up
- Took quick actions (invest, hire) without knowing if presenter will respond
- Currently a dead-end for them too

### Real Impact
From a presenter's perspective after their demo:
> "I presented my startup to 50+ people. Some voted for me, some didn't. I have no idea who was interested in investing, who wanted to connect, or what I should improve for next time. The event ended and I'm left guessing."

---

## Proposed Solution

### Demo Presenter Dashboard

A private dashboard for each demo presenter showing:

**1. Performance Summary**
- Total feedback count
- Average rating
- Total claps received
- Award placement (if applicable)

**2. Interested Attendees**
- List of people who clicked "Tell Me More"
- People who took quick actions (invest, hire, partner, collaborate)
- Include: Name, email, LinkedIn, attendee type (Founder/Investor/etc)
- Allow: Export to CSV, one-click email to all interested parties

**3. Detailed Feedback**
- Individual ratings (anonymous)
- Comments left by attendees (anonymous)
- Breakdown of quick actions taken

**4. Improvement Insights**
- "Your demo ranked #3 out of 10 in average rating"
- "85% of attendees who gave feedback rated you 4+ stars"
- "Most common quick action: 'Invest' (8 people)"

### How It Works

1. **After the event**, presenter gets an email: "Your demo results are ready!"
2. **Click link** to their personalized dashboard (using existing demo secret URL pattern)
3. **View insights** about their performance
4. **Export contacts** of interested attendees
5. **Follow up** with their leads

### Why This Matters

**For Presenters:**
- Closes the feedback loop
- Provides actionable data to improve
- Enables follow-up with interested parties
- Makes presenting worthwhile beyond just "winning"

**For Attendees:**
- Their interest signals actually reach the presenter
- More likely to get follow-up from demos they liked
- Validates that their feedback matters

**For Event Organizers:**
- Happier presenters = more repeat participation
- Differentiator from other demo events
- Increases perceived value of presenting

**For the Community:**
- Facilitates actual connections (the whole point!)
- Turns events into relationship-building, not just presentations
- Measurable ROI for presenters

---

## User Stories

### US1: See My Demo Performance
**As a** demo presenter  
**I want to** see how my demo performed (ratings, feedback count, placement)  
**So that** I know if my presentation resonated with the audience

**Acceptance Criteria:**
- Can access dashboard via secret link sent to demo email
- See average rating, total feedback, total claps
- See ranking compared to other demos (e.g., "#3 out of 10")
- View award placement if won

### US2: Connect With Interested Attendees
**As a** demo presenter  
**I want to** see who clicked "Tell Me More" or took quick actions  
**So that** I can follow up with potential investors, customers, or partners

**Acceptance Criteria:**
- List shows attendee name, email, LinkedIn, type
- Grouped by action type (Tell Me More, Invest, Hire, Partner, etc.)
- Can export list to CSV
- Can copy all emails for batch outreach

### US3: Read Detailed Feedback
**As a** demo presenter  
**I want to** read comments and see ratings from attendees  
**So that** I can understand what worked and what to improve

**Acceptance Criteria:**
- See all comments (anonymized to protect attendees)
- See distribution of ratings (e.g., "5 people gave 5 stars, 3 gave 4 stars")
- Comments are moderated/appropriate (organizer can hide if needed)

### US4: Track Across Multiple Events
**As a** repeat presenter  
**I want to** see my performance across multiple demo nights  
**So that** I can track my improvement over time

**Acceptance Criteria:**
- Dashboard shows all events I've presented at
- Can compare performance metrics across events
- See trajectory (improving, stable, declining)

### US5: Share My Results
**As a** demo presenter  
**I want to** share my demo performance publicly  
**So that** I can showcase social proof to investors or on social media

**Acceptance Criteria:**
- Generate shareable public link with key stats
- Optionally hide sensitive data (attendee contacts)
- Creates nice visual card for sharing

---

## Technical Implementation

### Database
**No schema changes needed!** All data already exists:
- `Demo` table has the demo info
- `Feedback` table has ratings, claps, comments, tellMeMore, quickActions
- `Attendee` table has contact info (name, email, LinkedIn, type)
- Link them through existing relations

### API Endpoints
Add to `src/server/api/routers/demo.ts`:

```typescript
// Get demo dashboard data
getDashboard: publicProcedure
  .input(z.object({ id: z.string(), secret: z.string() }))
  .query(async ({ input }) => {
    // Verify secret matches demo
    const demo = await db.demo.findUnique({
      where: { id: input.id, secret: input.secret },
      include: {
        event: { select: { name: true, date: true } },
        feedback: {
          include: {
            attendee: {
              select: {
                name: true,
                email: true,
                linkedin: true,
                type: true,
              },
            },
          },
        },
        awards: { select: { name: true, index: true } },
      },
    });
    
    // Calculate stats
    const avgRating = average(feedback.map(f => f.rating));
    const totalClaps = sum(feedback.map(f => f.claps));
    const interestedAttendees = feedback.filter(f => 
      f.tellMeMore || f.quickActions.length > 0
    );
    
    return {
      demo,
      stats: { avgRating, totalClaps, feedbackCount, ranking },
      interestedAttendees,
      allFeedback: feedback,
    };
  })
```

### UI Components

Create new page: `src/app/(demoist)/[eventId]/[demoId]/dashboard/page.tsx`

URL pattern: `https://app.com/sf-demo/demo-1/dashboard?secret=abc123`

**Components needed:**
1. `PerformanceSummary.tsx` - Stats cards (rating, claps, rank)
2. `InterestedAttendeesList.tsx` - Table of contacts with export button
3. `FeedbackList.tsx` - Comments and ratings display
4. `DashboardHeader.tsx` - Demo name, event info
5. `ExportButton.tsx` - CSV download of contacts

### Email Notification

After event moves to "Recap" phase, send email to each presenter:

```typescript
// In event phase transition logic
if (newPhase === EventPhase.Recap) {
  const demos = await db.demo.findMany({ 
    where: { eventId }, 
    include: { feedback: true }
  });
  
  for (const demo of demos) {
    if (demo.email && demo.feedback.length > 0) {
      await sendDemoDashboardEmail({
        to: demo.email,
        demoName: demo.name,
        dashboardUrl: `${env.NEXT_PUBLIC_URL}/${eventId}/${demo.id}/dashboard?secret=${demo.secret}`,
        feedbackCount: demo.feedback.length,
        avgRating: calculateAvg(demo.feedback),
      });
    }
  }
}
```

### Privacy Considerations

**What to show:**
- Attendee contact info ONLY if they clicked "Tell Me More" or quick action
- Ratings and comments are anonymous (don't show who said what)
- Aggregate stats are always safe to show

**What NOT to show:**
- Contact info of people who only left ratings/comments
- Individual attendee's specific rating or comment (keep anonymous)

### Existing Patterns
This follows established patterns in the codebase:
- Demo secret URL access (already used for demo editing)
- Email notifications (already used for submissions)
- Feedback display (already shown to admins)
- CSV export (already used in admin dashboard)

---

## Implementation Plan

### Phase 1: Core Dashboard (Week 1)
**Goal**: Basic presenter dashboard with stats and feedback

1. **API Endpoint** (4 hours)
   - Create `demo.getDashboard` query
   - Aggregate feedback data
   - Calculate stats (avg rating, claps, ranking)

2. **Dashboard Page** (6 hours)
   - Create page at `/[eventId]/[demoId]/dashboard`
   - Build `PerformanceSummary` component
   - Display feedback and comments
   - Handle authentication via secret param

3. **Testing** (2 hours)
   - Test with seed data
   - Verify privacy (only demo owner can access)
   - Mobile responsive

### Phase 2: Interested Attendees (Week 1-2)
**Goal**: Show and export interested contacts

1. **Attendee List Component** (4 hours)
   - Filter feedback for tellMeMore or quickActions
   - Display attendee contact info in table
   - Group by action type

2. **Export Functionality** (3 hours)
   - CSV export button
   - Email copy button
   - Format properly for outreach tools

### Phase 3: Email Notifications (Week 2)
**Goal**: Notify presenters when results are ready

1. **Email Template** (2 hours)
   - Create `DemoDashboardReady.tsx` email
   - Include key stats preview
   - Link to dashboard

2. **Trigger Logic** (2 hours)
   - Send emails when event → Recap phase
   - Only send if demo has feedback
   - Track sent status to avoid duplicates

### Phase 4: Polish & Enhancements (Week 2-3)

1. **Multi-Event View** (Optional, 4 hours)
   - Show presenter's history across events
   - Compare performance over time

2. **Public Sharing** (Optional, 3 hours)
   - Generate shareable link (no contacts shown)
   - Social media preview card

**Total Time**: ~30-40 hours (with optional features)

---

## Success Metrics

### Adoption (3 months post-launch)
- ✅ 70%+ of presenters access their dashboard within 1 week of event
- ✅ Average session duration > 2 minutes (they're actually reading)
- ✅ 50%+ export the interested attendees list

### Presenter Satisfaction
- ✅ Survey: "How valuable was the dashboard?" > 4/5 stars
- ✅ Qualitative: "I followed up with 5 people who clicked 'Invest'"
- ✅ Repeat presenters increase by 20% (they found value)

### Feature Usage
- ✅ 60%+ of presenters with interested attendees follow up
- ✅ Dashboard links are shared on social media (public sharing feature)
- ✅ Presenters reference feedback in future submissions

### Community Impact
- ✅ More connections made (measure LinkedIn connections post-event)
- ✅ Presenters report higher satisfaction vs. events without dashboard
- ✅ Word-of-mouth: "Demo Night has the best post-event experience"

---

## Challenges & Solutions

### Challenge 1: Privacy & Consent
**Issue**: Sharing attendee contact info with presenters

**Solution**:
- Only share contacts of people who explicitly signaled interest
- "Tell Me More" and quick actions are clear intent to connect
- Regular feedback stays anonymous
- Include opt-out option for attendees

### Challenge 2: Low Feedback Volume
**Issue**: Some demos may get 0-2 pieces of feedback (not statistically meaningful)

**Solution**:
- Show message: "Limited feedback available - we recommend getting at least 5 responses for meaningful insights"
- Still show what data exists
- Encourage organizers to promote feedback during event

### Challenge 3: Presenter Expectations
**Issue**: Presenters might be disappointed by critical feedback or low metrics

**Solution**:
- Frame everything constructively: "Areas to improve" not "weaknesses"
- Show comparative context (ranking helps vs. just absolute numbers)
- Highlight positives first, then improvement areas
- Include resources: "How to improve your demo presentation"

### Challenge 4: Email Deliverability
**Issue**: Dashboard notification emails might go to spam

**Solution**:
- Send from trusted domain
- Include email preview in submission confirmation
- Add reminder in recap phase attendee view
- Organizer can manually reshare links if needed

---

## Future Enhancements

Once core dashboard is validated:

1. **Comparative Analytics** (Phase 2)
   - "Your rating was 15% above average for this event"
   - "Demos in your category typically get 3-5 interested parties"

2. **AI-Powered Insights** (Phase 3)
   - Analyze comments for themes: "3 people mentioned 'pricing concerns'"
   - Suggest improvements based on successful similar demos

3. **Follow-Up Automation** (Phase 3)
   - Email template generator for reaching out to interested parties
   - CRM integration (HubSpot, Salesforce)

4. **Social Sharing** (Phase 2)
   - Auto-generate "I presented at Demo Night" posts
   - Include key stats in shareable format

5. **Longitudinal Tracking** (Phase 2)
   - For repeat presenters: "Your rating improved 20% since last event!"
   - Track improvement trajectory

## Why This Feature Now?

**Timing**: 
- Chapter system just launched → more events → more presenters
- Current feedback system is mature and working well
- Missing piece is the presenter experience

**Leverage**:
- Uses all existing data (no new collection needed)
- Builds on demo secret URL pattern (already works)
- Extends existing email notification system

**Differentiation**:
- Most demo events give no post-event value to presenters
- This makes Demo Night App stand out
- Increases perceived value of presenting (more submissions!)

**Low Risk**:
- No breaking changes to existing features
- If low adoption, minimal maintenance burden
- Can disable per-event if organizers don't want it

---

## Conclusion

### The Gap
Presenters invest significant time preparing and presenting demos, but currently get zero post-event value beyond potential award wins. Their feedback data exists in the system but is invisible to them. Attendees signal interest ("Tell Me More", quick actions) with no guarantee the presenter will see it.

### The Solution
A simple, focused dashboard that:
- Closes the feedback loop for presenters
- Enables follow-up with interested attendees  
- Provides actionable insights for improvement
- Requires no new data collection or schema changes

### The Impact
**For Presenters**: Finally know how their demo was received and can follow up with leads
**For Attendees**: Their interest signals actually reach the presenter  
**For Organizers**: Happier presenters = more submissions and better demos  
**For Community**: More connections = more value from demo nights

### Why It Works
✅ Solves a real pain point (feedback black hole)  
✅ Uses existing data (no new complexity)  
✅ Quick to build (~30-40 hours)  
✅ Low risk, high reward  
✅ Differentiates Demo Night App from competitors

---

**Feature**: Demo Presenter Dashboard  
**Status**: Proposed  
**Effort**: ~4-5 weeks  
**Value**: High (closes critical feedback loop)  
**Risk**: Low (builds on existing patterns)
