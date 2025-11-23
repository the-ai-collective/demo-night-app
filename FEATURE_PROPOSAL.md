# Feature Proposal: Analytics & Insights Dashboard


---

## How I Identified This Opportunity

While exploring the Demo Night App codebase for the take-home assignment, I noticed:

1. **Rich data model** - The schema includes extensive tracking (submissions, demos, feedback, votes, awards across multiple events and chapters)
2. **Chapter system** - The newly-added chapter management (Task 1) enables multi-location tracking
3. **No analytics aggregation** - The admin interface shows individual events but no cross-event insights
4. **Mature product stage** - Multiple models suggest the app has accumulated meaningful historical data

This led me to wonder: **Are event organizers manually analyzing this data, or is there an opportunity to provide automated insights?**

---

## Problem Hypothesis

**I believe event organizers running multiple Demo Night events may struggle to:**
- Understand patterns across events (What makes demos successful? Which chapters have highest engagement?)
- Make data-driven decisions about event planning and demo selection
- Benchmark performance across locations and time periods

**However, I don't have validation that this is an actual pain point.** Before building this feature, I would want to:
- Interview 3-5 event organizers about their current analytics workflow
- Understand what manual reports they currently create
- Identify which metrics they care about most
- Determine if existing tools (Google Sheets, Notion, etc.) are sufficient

---

## Proposed Solution (If Validated)

A lightweight **Analytics Dashboard** in `/admin/analytics` that provides:

### Phase 1: MVP (8-10 hours)
Focus on proving value with minimal scope:

1. **Overview Cards** - 4 simple KPIs:
   - Total events hosted
   - Total demos presented
   - Total attendees served (from Attendee count)
   - Average feedback rating

2. **Chapter Comparison Table** - Basic benchmarking:
   - Events per chapter
   - Avg demos per event
   - Avg feedback score

3. **Recent Events List** - Simple table with:
   - Event name, date, chapter
   - # demos, # attendees, avg rating
   - Sortable columns

**Why this scope?** 
- Delivers immediate value in <2 days
- Uses only simple aggregations (no complex queries)
- Gets feedback before investing in charts/visualizations
- Tests actual organizer interest

### Future Phases (Only if MVP proves valuable)
- Time-series trends
- Submission funnel analysis
- Winner pattern insights
- Advanced filtering and exports

---

## Open Questions (Would Ask Before Building)

1. **Usage Patterns**
   - How are organizers currently tracking event performance?
   - Do they export data to Google Sheets/Excel? If so, what do they analyze?
   - What questions are they trying to answer that the current UI doesn't support?

2. **Priorities**
   - Is cross-event analytics a top 3 need right now?
   - Are there more urgent admin workflow improvements?
   - What would make organizers use this weekly vs. monthly?

3. **Access Control**
   - Should chapter organizers only see their chapter's data?
   - Or can all admins see all chapters (current admin model)?
   - Privacy considerations for comparing chapters?

4. **Technical Constraints**
   - How many events exist in production? (Affects query performance)
   - Are there any existing analytics tools integrated?
   - What's the performance budget for analytics queries?

---

## Hypothetical User Stories (Unvalidated)

**If organizers do need analytics**, these scenarios might resonate:

1. **"Compare chapters to share best practices"**
   - See which chapters have highest feedback scores
   - Identify what they're doing differently
   - Share tactics across locations

2. **"Understand what makes demos successful"**
   - Look at winning demos' feedback patterns
   - Identify common characteristics
   - Improve future demo selection

3. **"Track program growth over time"**
   - See if events are getting bigger/better
   - Justify continued investment to stakeholders
   - Celebrate milestones

**But again - these need validation with real users before building.**

---

## Technical Approach

### Database Changes

**No schema changes required!** All necessary data already exists in current tables. Will leverage existing models:
- `Event`, `Submission`, `Demo`, `Attendee`, `Feedback`, `Vote`, `Award`, `Chapter`

### New tRPC Router: `analytics.ts`

```typescript
export const analyticsRouter = createTRPCRouter({
  // Overview metrics
  getOverview: protectedProcedure.query(),
  
  // Submission analytics
  getSubmissionTrends: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      chapterId: z.string().optional(),
    }))
    .query(),
  
  // Demo performance
  getDemoPerformance: protectedProcedure
    .input(z.object({ eventId: z.string().optional() }))
    .query(),
  
  // Engagement metrics
  getEngagementMetrics: protectedProcedure
    .input(z.object({ timeRange: z.enum(['7d', '30d', '90d', 'all']) }))
    .query(),
  
  // Chapter comparison
  getChapterComparison: protectedProcedure.query(),
  
  // Winner analysis
  getWinnerPatterns: protectedProcedure.query(),
});
```

### UI Components (React/Next.js)

#### Page Structure: `/admin/analytics`

```
/admin/analytics
├── Overview Cards (KPIs)
├── Event Performance Chart
├── Submission Funnel
├── Engagement Heatmap
└── Chapter Comparison Table
```

#### Key Components

1. **`OverviewStats.tsx`** - Four stat cards showing:
   - Total Events Hosted
   - Total Demos Presented  
   - Total Attendees Served
   - Average Feedback Score

2. **`SubmissionFunnel.tsx`** - Sankey diagram showing:
   - Submissions → Pending → Confirmed → Presented → Won Award

3. **`EngagementChart.tsx`** - Time-series line chart:
   - Feedback completion rate over time
   - Average claps per demo by event
   - Voting participation rate

4. **`ChapterComparison.tsx`** - Comparison table:
   - Events per chapter
   - Avg attendees per event
   - Avg feedback score
   - Submission acceptance rate

5. **`WinnerInsights.tsx`** - Pattern analysis:
   - Common characteristics of winning demos
   - Submission timing analysis
   - Feedback score distribution

### Data Aggregation Strategy

#### Approach A: Real-time calculation (Recommended for MVP)
- Calculate metrics on-demand in tRPC procedures
- Use Prisma aggregations and groupBy queries
- Cache results with React Query (5-minute stale time)
- **Pros**: Simple, always up-to-date, no additional infrastructure
- **Cons**: Slower for large datasets

#### Approach B: Materialized views (Future optimization)
- Pre-compute aggregate tables nightly
- Store in new `AnalyticsSnapshot` model
- Update incrementally on event completion
- **Pros**: Fast queries, scalable
- **Cons**: More complex, requires scheduled jobs

**Decision**: Start with Approach A for MVP. The dataset size (dozens of events) is manageable. Migrate to Approach B if query performance degrades with scale.

### Charting Library

**Recommendation**: [Recharts](https://recharts.org/)
- Already React-friendly, TypeScript support
- Covers all chart types needed (line, bar, sankey, pie)
- Lightweight, well-documented
- SSR compatible with Next.js

```bash
yarn add recharts
```

---

## Realistic Implementation Plan (Phase 1 MVP Only)

### Week 1: Build & Validate (8-10 hours)

**Day 1-2: Backend (4 hours)**
- [ ] Create `analytics` tRPC router in `src/server/api/routers/analytics.ts`
- [ ] Implement `getOverview` query with basic aggregations:
  ```typescript
  getOverview: protectedProcedure.query(async () => {
    const [eventCount, demoCount, attendeeCount, avgFeedback] = 
      await Promise.all([
        db.event.count(),
        db.demo.count(),
        db.attendee.count(),
        db.feedback.aggregate({ _avg: { rating: true } })
      ]);
    return { eventCount, demoCount, attendeeCount, avgRating: avgFeedback._avg.rating };
  })
  ```
- [ ] Add `getChapterComparison` query
- [ ] Register router in `src/server/api/root.ts`

**Day 3-4: Frontend (4 hours)**
- [ ] Create `/admin/analytics/page.tsx` with basic layout
- [ ] Build 4 stat cards using existing shadcn/ui components
- [ ] Create simple chapter comparison table
- [ ] Add navigation link in admin sidebar

**Day 5: Testing & Refinement (2 hours)**
- [ ] Test with actual database data
- [ ] Add loading/error states
- [ ] Verify no performance issues
- [ ] **Get feedback from an organizer (if possible)**

### Decision Point: Continue or Pivot?

After MVP, evaluate:
- Did organizers find it useful?
- What metrics did they want but didn't get?
- Is this worth continuing vs. other features?

**Only proceed to Phase 2+ if MVP validates the need.**

---

## How I Would Measure Success

### For MVP Phase

**Primary Goal**: Validate whether organizers find value in cross-event analytics

**Metrics to Track:**
1. **Initial Usage** - Do organizers visit the page in first week after launch?
2. **Return Usage** - Do they come back? (Indicates actual utility vs. curiosity)
3. **Feedback Quality** - What do they say is missing or confusing?
4. **Query Performance** - Do aggregation queries complete in <3 seconds?

**Success Signal:** 
- 3+ organizers visit analytics page multiple times in first month
- Receive at least one piece of positive feedback ("This helped me understand X")
- No major performance complaints

**Failure Signal:**
- Nobody uses it after initial launch
- Feedback is "This doesn't tell me anything useful"
- Performance degrades with real data volume

### Long-Term (If MVP Succeeds)

**Would track (with proper analytics tooling):**
- Weekly active users among admin accounts
- Time spent on analytics page
- Which metrics get viewed most (to prioritize Phase 2)
- Feature requests and pain points

**Bigger question:** Does this actually improve event quality?
- That's harder to attribute, would need controlled comparison
- Or survey organizers: "Did analytics influence any decisions?"

---

## Risks & Unknowns

### 1. Problem-Solution Fit
**Uncertainty**: Do organizers actually need this, or are they happy with current tools?
- **De-risk by**: User interviews before building anything
- **Or**: Build tiny MVP and see if anyone uses it

### 2. Data Volume
**I don't know**: How many events exist in production? 10? 100? 1000?
- If <50 events: Simple aggregations will be fast
- If >500 events: May need pagination, caching, or materialized views
- **De-risk by**: Check production database size before committing

### 3. Query Performance
**Concern**: Complex joins across 8+ tables could be slow
- MVP only does COUNT() and AVG() aggregations (should be fast)
- But without testing on real data, hard to predict
- **De-risk by**: Profile queries in staging environment first

### 4. Building the Wrong Thing
**Biggest risk**: Spending 8-10 hours on a feature nobody wants
- **De-risk by**: 
  - Show mockups/wireframes first (15 min to make)
  - Ask: "Would this be useful? What's missing?"
  - Get approval before writing code

### 5. Alternative Solutions
**Maybe**: Organizers already solved this problem
- They might export to Google Sheets and be happy
- Or use external analytics tools
- Or not care about analytics at all
- **De-risk by**: Ask what they currently do

---

## Alternative Approaches Worth Considering

**Before building custom analytics, worth exploring:**

### 1. Enhanced CSV Export
- Add "Export All Events" button that generates comprehensive CSV
- Organizers can analyze in Google Sheets/Excel (tools they know)
- **Pros**: Zero dev time, maximum flexibility
- **Cons**: Requires data analysis skills, manual work

### 2. Existing Tools (Posthog, Metabase, etc.)
- Connect production DB to analytics tool
- **Pros**: Professional dashboards, no custom code
- **Cons**: Additional cost, setup complexity
- **Question**: What's the budget for this?

### 3. Do Nothing
- Maybe organizers don't actually need this
- Current event-by-event view might be sufficient
- **Worth validating** before assuming there's a problem

---

## Dependencies & Requirements

### Technical Dependencies
- Recharts library for visualization (`yarn add recharts`)
- No additional API keys or external services required
- Existing Prisma database with historical event data

### User Requirements
- Admin authentication (already implemented)
- At least 3-5 historical events for meaningful insights
- Chapter data (newly implemented in Task 1)

### Deployment Requirements
- No additional infrastructure needed
- Analytics queries run on existing PostgreSQL database
- Consider adding database read replica if query load increases

---

## Possible Future Directions (If MVP Succeeds)

**Only worth considering after validating Phase 1:**

- Time-series charts showing trends over months
- Submission funnel analysis (PENDING → CONFIRMED → PRESENTED)
- Winner analysis (common patterns among award winners)
- Export to CSV/PDF for presentations
- Email digest reports (weekly summary)

**But honestly:** Better to learn what users actually want from MVP usage patterns rather than spec everything upfront.

---

## Appendix

### Example Queries

#### Get Overview Stats
```typescript
const totalEvents = await db.event.count();
const totalDemos = await db.demo.count();
const totalAttendees = await db.attendee.count();
const avgFeedback = await db.feedback.aggregate({
  _avg: { rating: true }
});
```

#### Get Submission Funnel
```typescript
const funnelData = await db.submission.groupBy({
  by: ['status'],
  _count: { id: true },
  where: { eventId: { in: eventIds } }
});
```

#### Get Engagement by Chapter
```typescript
const engagementByChapter = await db.event.findMany({
  include: {
    chapter: true,
    _count: {
      select: {
        feedback: true,
        votes: true,
        attendees: true,
      }
    }
  }
});
```

### Simple MVP Wireframe Concept

```
┌────────────────────────────────────────────────┐
│  Analytics Overview                             │
├────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────┐│
│  │ Events   │ │  Demos   │ │ Attendees│ │Avg ││
│  │   42     │ │   387    │ │  2,458   │ │4.2 ││
│  └──────────┘ └──────────┘ └──────────┘ └────┘│
│                                                 │
│  Chapter Comparison                             │
│  ┌─────────────────────────────────────────────┤
│  │ Chapter    │ Events │ Avg Demos │ Avg Rating│
│  │ SF         │   15   │    25     │    4.5   ││
│  │ NYC        │   12   │    22     │    4.2   ││
│  │ Boston     │    8   │    18     │    4.7   ││
│  └─────────────────────────────────────────────│
└────────────────────────────────────────────────┘
```

**That's it for MVP** - just cards and a table. Add charts later if useful.

---

## Reflection & Next Steps

### What This Proposal Demonstrates

**Product Thinking:**
- Identified a potential opportunity by exploring the data model
- Recognized the need for user validation before building
- Proposed a small MVP to test assumptions quickly
- Acknowledged uncertainties and risks honestly

**Technical Depth:**
- Understanding of database aggregations and performance considerations
- Awareness of the existing stack (tRPC, Prisma, React Query)
- Realistic implementation timeline for a scoped feature

**Product Judgment:**
- Prioritized learning over building (user research first)
- Suggested starting small rather than over-engineering
- Identified decision points to pivot or continue

### Honest Assessment

**Strengths of this proposal:**
- Leverages existing data without schema changes
- Low-risk MVP approach
- Clear validation criteria

**Weaknesses:**
- No actual user validation (just hypotheses)
- May not be a high-priority need
- Could be solving a non-problem

### What I Would Do Next (If This Were Real)

1. **Week 1**: Interview 3 organizers about current analytics workflow
2. **If validated**: Build 4-hour proof-of-concept (just stat cards)
3. **Get feedback**: "Is this useful? What's missing?"
4. **Decision**: Continue, pivot, or kill

**For this assignment:**
This proposal serves to demonstrate how I think about product development - balancing user needs, technical constraints, and pragmatic scope decisions.

---

## Appendix: Technical Details



