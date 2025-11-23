# Feature Proposal: Analytics & Insights Dashboard

**Author**: AI Engineer  
**Date**: November 21, 2025  
**Status**: Proposal

---

## Executive Summary

This proposal introduces a comprehensive **Analytics & Insights Dashboard** for Demo Night App that provides event organizers with cross-event analytics, trends, and actionable insights to improve event quality and attendee engagement. The dashboard will help organizers understand what makes demos successful, identify engagement patterns, and make data-driven decisions when planning future events.

---

## Problem Statement

### Who experiences this problem?

**Event Organizers** (admins) who run multiple Demo Night events and need to:
- Understand what types of demos resonate with audiences
- Identify trends in submissions, attendance, and engagement
- Compare performance across different chapters and time periods
- Make data-driven decisions about event format and demo selection

### What is the problem?

Currently, Demo Night App stores rich data across events (submissions, demos, feedback, votes, awards) but provides **no way to aggregate or analyze this data holistically**. Event organizers must:

1. **Manually export and analyze data** from each event individually
2. **Lack visibility into trends** - Which demo categories perform best? Are certain chapters more engaged?
3. **Cannot benchmark performance** - Is this event's submission quality higher or lower than previous ones?
4. **Miss optimization opportunities** - What feedback patterns correlate with winning demos?

### Evidence

- The app has been running multiple events across chapters (SF, NYC, Boston, etc.) as evidenced by the recently-added chapter management system
- Event data model shows rich feedback mechanisms (ratings, claps, tellMeMore, quickActions, comments)
- No existing analytics pages in the admin dashboard beyond individual event views
- LinkedIn post shows 300+ attendees at recent events, indicating scale where analytics become crucial

---

## Proposed Solution

Create an **Analytics & Insights Dashboard** as a new section in the admin interface (`/admin/analytics`) that provides:

1. **Event Performance Metrics** - Aggregate KPIs across all events
2. **Submission Analytics** - Quality trends, acceptance rates, time-to-decision
3. **Attendee Engagement** - Feedback rates, voting participation, satisfaction scores
4. **Demo Success Patterns** - Characteristics of winning demos, feedback analysis
5. **Chapter Comparisons** - Performance benchmarking across geographic chapters
6. **Time-Series Trends** - Month-over-month growth and seasonal patterns

### Key Differentiators

- **Cross-event insights** not just single-event stats
- **Predictive elements** (e.g., "This submission profile similar to 3 past winners")
- **Actionable recommendations** not just raw numbers
- **Export capabilities** for presentations and reports

---

## User Stories

### As an Event Organizer, I want to...

1. **View aggregate statistics across all events** so that I can understand overall program health and growth trends.
   - *Acceptance criteria*: Dashboard shows total events, demos presented, attendees served, and growth metrics
   
2. **Compare submission quality across events** so that I can identify which events attract the strongest demos.
   - *Acceptance criteria*: Chart showing average submission ratings by event with filtering by chapter and date range

3. **Identify characteristics of winning demos** so that I can better screen future submissions.
   - *Acceptance criteria*: Analytics showing common attributes of award-winning demos (categories, submission timing, feedback patterns)

4. **Analyze attendee engagement patterns** so that I can optimize event format and timing.
   - *Acceptance criteria*: Metrics on feedback completion rates, average claps per demo, voting participation by event phase

5. **Benchmark performance across chapters** so that I can share best practices between locations.
   - *Acceptance criteria*: Side-by-side comparison of key metrics (submission volume, attendee engagement, winner characteristics) by chapter

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

## Implementation Plan

### Phase 1: Foundation (Week 1) - 8 hours
- [ ] Create `/admin/analytics` page with basic layout
- [ ] Build `analytics` tRPC router with overview query
- [ ] Implement `OverviewStats` component with 4 KPI cards
- [ ] Add navigation link in admin dashboard

### Phase 2: Submission Analytics (Week 1-2) - 6 hours
- [ ] Build submission trends query (aggregating by status, date)
- [ ] Create `SubmissionFunnel` component with Sankey diagram
- [ ] Add filters for date range and chapter
- [ ] Show acceptance rate trends over time

### Phase 3: Engagement Metrics (Week 2) - 6 hours
- [ ] Query feedback and voting data with aggregations
- [ ] Build `EngagementChart` with time-series visualization
- [ ] Add drill-down capability to view event-specific details
- [ ] Show heatmap of engagement by event/chapter

### Phase 4: Chapter & Winner Analysis (Week 3) - 8 hours
- [ ] Implement chapter comparison query with benchmarking
- [ ] Create `ChapterComparison` table component
- [ ] Build winner pattern analysis query
- [ ] Design `WinnerInsights` component with key patterns
- [ ] Add export to CSV functionality

### Phase 5: Polish & Testing (Week 3) - 4 hours
- [ ] Add loading states and error handling
- [ ] Optimize queries for performance
- [ ] Write unit tests for analytics calculations
- [ ] User testing with event organizers
- [ ] Documentation and README updates

**Total Estimate**: 32 hours (~4 weeks at 8 hours/week)

---

## Success Metrics

### Quantitative Metrics

1. **Adoption Rate**: 80% of active organizers use analytics within 30 days of launch
2. **Session Duration**: Organizers spend avg 5+ minutes on analytics page
3. **Data-Driven Decisions**: 50% of new event planning discussions reference analytics insights
4. **Query Performance**: All analytics queries return in <2 seconds at 95th percentile

### Qualitative Metrics

1. **User Satisfaction**: Net Promoter Score (NPS) of 8+ from event organizers
2. **Insight Quality**: Organizers report discovering at least 2 actionable insights
3. **Decision Impact**: Analytics directly influences at least 1 process improvement per chapter

### Success Indicators (3 months post-launch)

- **Improved Event Quality**: Average feedback scores increase by 10%
- **Better Demo Selection**: Submission acceptance rate becomes more consistent across chapters
- **Higher Engagement**: Attendee feedback completion rate increases by 15%
- **Process Efficiency**: Time spent on event planning reduces by 20%

---

## Potential Challenges & Mitigation

### Challenge 1: Query Performance with Large Datasets

**Risk**: As events grow, aggregating all historical data could become slow

**Mitigation**:
- Start with indexed queries and React Query caching
- Implement pagination and "load more" patterns
- Use database query optimization (proper indexes on timestamp columns)
- Have Approach B (materialized views) ready as fallback

### Challenge 2: Privacy & Data Sensitivity

**Risk**: Analytics might reveal sensitive patterns about attendees or submissions

**Mitigation**:
- Only show aggregate data, never individual attendee names
- Require admin authentication for all analytics routes
- Add option to exclude specific events from analytics
- Document data handling in privacy policy

### Challenge 3: Misleading Insights from Small Sample Sizes

**Risk**: Early-stage chapters with few events might draw incorrect conclusions

**Mitigation**:
- Show sample size prominently on all charts
- Add "statistical significance" indicators
- Display confidence intervals on predictions
- Provide educational tooltips about interpreting data

### Challenge 4: Feature Complexity vs. MVP Scope

**Risk**: Attempting to build too comprehensive a solution in initial release

**Mitigation**:
- Focus Phase 1-3 on core metrics (overview, submissions, engagement)
- Ship MVP with 3-4 key visualizations
- Gather user feedback before building advanced features
- Iterate based on actual usage patterns

---

## Alternative Approaches Considered

### Alternative 1: Third-Party Analytics Platform (e.g., Metabase, Looker)

**Pros**: Professional-grade dashboards, no custom development needed  
**Cons**: Additional infrastructure cost, learning curve, less customized to Demo Night workflow  
**Decision**: Rejected - Custom solution provides better UX and keeps costs low for open-source project

### Alternative 2: CSV Export + Manual Analysis

**Pros**: Zero development time, maximum flexibility for power users  
**Cons**: High friction, requires data analysis skills, no visual insights  
**Decision**: Rejected - Too manual, doesn't serve less technical organizers

### Alternative 3: Email Digest Reports

**Pros**: Proactive delivery of insights, no need to visit dashboard  
**Cons**: Less interactive, harder to explore data deeply, email fatigue  
**Decision**: Consider as Phase 6 add-on after dashboard proves valuable

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

## Future Enhancements (Post-MVP)

1. **Predictive Scoring**: ML model to predict submission quality based on historical patterns
2. **Real-Time Dashboard**: Live updating during events for instant feedback insights
3. **Automated Reports**: Weekly email summaries of key metrics
4. **Benchmarking**: Compare your event against anonymized industry averages
5. **A/B Testing Framework**: Test different event formats and measure impact
6. **Integration APIs**: Export metrics to Notion, Airtable, or Google Sheets
7. **Mobile App**: Dedicated mobile analytics for on-the-go organizers
8. **Custom Dashboards**: Let organizers build their own metric combinations

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

### Mockup Wireframes

```
┌─────────────────────────────────────────────────────────┐
│  Analytics & Insights                    🔍 [Filters]   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────┐│
│  │   Total     │ │    Demos    │ │  Attendees  │ │ Avg││
│  │   Events    │ │  Presented  │ │   Served    │ │Feed││
│  │     42      │ │     387     │ │   12,458    │ │4.3 ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────┘│
│                                                           │
│  Event Performance Over Time                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │     📈 [Line chart of events, submissions, attendance]│
│  │                                                       ││
│  │                                                       ││
│  └───────────────────────────────────────────────────────│
│                                                           │
│  Submission Funnel          │  Chapter Comparison        │
│  ┌────────────────────────┐ │ ┌────────────────────────┐│
│  │ 500 → 300 → 150 → 45   │ │ │ SF: 4.5 ⭐            ││
│  │ [Sankey diagram]       │ │ │ NYC: 4.2 ⭐           ││
│  └────────────────────────┘ │ │ Boston: 4.7 ⭐        ││
│                              │ └────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Similar Features in Other Products

1. **Eventbrite Analytics** - Provides ticket sales trends, attendee demographics
2. **Luma Analytics** - Shows RSVP patterns, attendance rates, engagement scores
3. **Devpost** - Hackathon analytics with submission trends, judging patterns
4. **GitHub Insights** - Repository analytics with contribution patterns, trends

---

## Conclusion

The Analytics & Insights Dashboard addresses a critical gap in Demo Night App by transforming raw event data into actionable insights. This feature will empower event organizers to make data-driven decisions, improve event quality, and scale the Demo Night program more effectively across chapters.

**Recommendation**: Proceed with MVP implementation (Phases 1-3) to validate core value proposition, then iterate based on user feedback.



