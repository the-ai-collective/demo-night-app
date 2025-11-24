# AI Submission Review & Curation Assistant

**Feature Proposal — Demo Night App**

## 1. Problem Statement

Event organizers manually review demo submissions, which becomes increasingly difficult as chapters grow and submissions scale. Current pain points include:

### 1.1 High Review Workload

Chapters often receive dozens or hundreds of submissions. Reviewing all manually is time-consuming and inconsistent across organizers. With 50+ submissions per event, organizers spend hours reading descriptions, taglines, and URLs with no guidance on prioritization.

### 1.2 No Structured Categorization

Submissions have no thematic tagging, stage-of-product indicator, or automated summarization. Organizers struggle to see the "shape" of the event:

- **Too many AI tools?** Are we getting repetitive submissions?
- **Any research demos?** Is there diversity in the lineup?
- **Any infrastructure projects?** What's the balance?
- **Are there duplicate or similar demos?** Should we consolidate?

Without this structure, organizers can't quickly understand the event's composition or identify gaps in the lineup.

### 1.3 No Guidance for New Organizers

New chapters or inexperienced organizers lack intuition for what a balanced demo lineup looks like. They don't know:

- What themes are overrepresented?
- What types of demos work well together?
- How to curate a diverse, engaging event?

### 1.4 Lack of Cross-Event Standardization

Since submissions are free-form, HQ cannot easily compare or analyze trends across chapters and events. There's no way to answer questions like:

- What types of AI projects are trending across chapters?
- Are certain themes more popular in specific regions?
- How do submission quality and themes evolve over time?

### Who Experiences the Problem?

- **Chapter organizers** reviewing demos for their events
- **Event hosts** curating the final lineup
- **AI Collective HQ** wanting to understand cross-chapter patterns
- **Attendees** indirectly, through inconsistent or unbalanced lineups

**This is a major friction point for scaling Demo Night globally.**

## 2. Proposed Solution: AI Submission Review & Curation Assistant

Add an AI-powered assistant inside the admin dashboard that analyzes all submissions for an event and generates comprehensive insights to help organizers curate better events.

### 2.1 Core Features

#### AI Summary Overview

Generate an event-level summary that answers:

- "What is the theme of this event?"
- "What types of AI projects were submitted?"
- "Are there notable clusters or patterns?"
- "What's the overall quality distribution?"

This gives organizers a high-level understanding before diving into individual submissions.

#### Auto-Tagging

Each submission receives automatically generated attributes:

- **Theme/Category**: Agents, Infrastructure, Devtools, LLM Applications, Research, Consumer Apps, Enterprise Tools, etc.
- **Stage**: MVP, Launched, Research, Prototype, Beta
- **Audience**: Consumer, Enterprise, Developer, Researcher
- **Additional tags**: Based on submission content (e.g., "multimodal", "code generation", "data analysis")

These tags become searchable and filterable, enabling organizers to:

- Filter by theme to see all "Agent" submissions
- Identify stage distribution (too many prototypes?)
- Ensure audience diversity

#### Highlighted Recommendations

AI scores each submission on multiple dimensions:

- **Clarity**: How well-written and clear is the submission?
- **Innovation**: How novel or interesting is the project?
- **Fit for Event**: Does it align with Demo Night's mission?
- **Potential Audience Excitement**: Will attendees find this engaging?

Based on these scores, the system proposes a **recommended lineup of 8-10 demos** that balances:

- Thematic diversity
- Stage variety
- Audience appeal
- Quality threshold

#### Duplicate / Similarity Detection

If two or more submissions are nearly identical or very similar, the system highlights:

- "These 3 demos appear similar — consider choosing one for variety."
- Side-by-side comparison of similar submissions
- Similarity score and reasoning

This prevents redundant lineups and helps organizers make informed choices.

#### Organizer-Centric UI

In the event's admin page, add an **"AI Review"** tab that shows:

- **Event-level summary** (themes, quality distribution, insights)
- **Auto-tags and summaries** for each submission
- **Suggested lineup** with reasoning
- **Flags** (low detail, duplicate, unclear, needs follow-up)
- **Tag distribution** visualization (optional chart)

#### Human in the Loop

**Critical**: This feature never auto-approves or rejects submissions. It assists organizers with recommendations, but all decisions remain human-controlled. The AI is an advisor, not a decision-maker.

### 2.2 User Experience Flow

1. **Organizer opens event admin page** → Sees "AI Review" tab
2. **Organizer clicks "Run AI Review"** → System analyzes all submissions (30-60 seconds)
3. **AI Review tab displays**:
   - Event summary at the top
   - Recommended lineup section
   - All submissions with AI tags, scores, and summaries
   - Flags and warnings
4. **Organizer uses insights** to:
   - Filter by tags to see thematic groups
   - Review recommended lineup
   - Check flagged submissions
   - Make informed curation decisions
5. **Organizer can re-run analysis** after making edits or receiving new submissions

## 3. User Stories

### User Story 1: Event-Level Summary

**As a** chapter organizer,  
**I want** an AI-generated summary of all submissions for my event,  
**So that** I can quickly understand the themes, quality distribution, and overall composition before reviewing individual submissions.

**Acceptance Criteria:**

- Summary is generated when organizer clicks "Run AI Review"
- Summary includes: dominant themes, quality distribution, notable patterns
- Summary is displayed prominently at the top of AI Review tab
- Summary updates when analysis is re-run

### User Story 2: Auto-Tagging

**As an** organizer,  
**I want** each submission to be auto-tagged with theme, stage, and audience type,  
**So that** I can filter and compare similar demos, ensure diversity, and identify gaps in the lineup.

**Acceptance Criteria:**

- Tags are generated automatically during AI analysis
- Tags are visible on each submission card
- Organizer can filter submissions by any tag
- Tags are searchable and persistent

### User Story 3: Recommended Lineup

**As an** organizer,  
**I want** an AI-suggested lineup of 8-10 demos,  
**So that** I can curate a balanced, diverse set of demos faster and use it as a starting point for my final decisions.

**Acceptance Criteria:**

- Recommended lineup is generated based on quality, diversity, and fit
- Each recommended demo shows reasoning (why it was selected)
- Organizer can see which submissions were not recommended and why
- Recommended lineup is clearly marked as "suggestions only"

### User Story 4: Flagging Low-Quality Submissions

**As an** organizer,  
**I want** the system to flag low-detail or unclear submissions,  
**So that** I know which entries may need follow-up questions or should be deprioritized.

**Acceptance Criteria:**

- Submissions with insufficient detail are flagged
- Flagged submissions show specific issues (e.g., "Description too short", "No demo URL")
- Flags are visible in both list and detail views
- Organizer can dismiss flags if they disagree

### User Story 5: Duplicate Detection

**As an** organizer,  
**I want** to be notified when multiple submissions are very similar,  
**So that** I can choose the best one and avoid redundant demos in the lineup.

**Acceptance Criteria:**

- Similar submissions are grouped and highlighted
- Similarity score and reasoning are shown
- Organizer can view side-by-side comparison
- Organizer can mark submissions as "not duplicates" if needed

### User Story 6: Cross-Event Analytics (HQ)

**As** AI Collective HQ,  
**I want** standardized metadata (tags, scores) stored consistently across all events,  
**So that** I can analyze trends across chapters, identify popular themes, and understand how the community evolves.

**Acceptance Criteria:**

- All AI-generated metadata is stored in database
- Metadata follows consistent schema across events
- HQ can query aggregated data across events
- Historical trends can be analyzed

## 4. Technical Approach

### 4.1 Database Changes (Prisma)

**Add fields to `Submission` model:**

```prisma
model Submission {
}
```

**Migration Strategy:**

- Add all new fields as nullable
- Existing submissions will have null values until analyzed
- No breaking changes to existing functionality

### 4.2 tRPC Endpoints

**New router: `submissionAiRouter`**

```typescript
export const submissionAiRouter = createTRPCRouter({
  analyzeEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // ...
    }),

  analyzeSingle: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // ...
    }),

  getEventSummary: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      // ...
    }),

  getRecommendedLineup: protectedProcedure
    .input(z.object({ eventId: z.string(), count: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      // ...
    }),

  findSimilar: protectedProcedure
    .input(z.object({ eventId: z.string(), submissionId: z.string() }))
    .query(async ({ input, ctx }) => {
      // ...
    }),
});
```

**Integration:**

- Add `submissionAi: submissionAiRouter` to main `appRouter` in `src/server/api/root.ts`

### 4.3 AI Integration

**For Assignment: Mock Implementation**

Create `src/server/ai/analyzer.ts`:

```typescript
export interface AIAnalysisResult {
}

export interface EventAnalysisResult {
}

/**
 * Mock AI analyzer for assignment.
 * In production, replace with real AI API call (Claude / OpenAI).
 */
export async function mockAnalyzeEvent(
  submissions: Submission[],
): Promise<EventAnalysisResult> {
  // ...
}
```

**Production Implementation Note:**

- Replace `mockAnalyzeEvent` with real API calls to Claude (Anthropic) or OpenAI
- Use structured output (JSON mode) for consistent parsing
- Implement proper error handling and retries
- Add rate limiting and cost tracking

**Example Production Implementation:**

```typescript
export async function analyzeEvent(
  submissions: Submission[],
): Promise<EventAnalysisResult> {
  // Replace with real AI API call (Claude / OpenAI)
  // ...
}
```

### 4.4 UI Components

**New Tab in Event Admin Page**

Location: `src/app/admin/[eventId]/components/AIReview/AIReviewTab.tsx`

```typescript
export default function AIReviewTab() {
  // ...
}
```

**Components to Create:**

1. **`EventSummaryCard.tsx`**

   - Displays event-level summary
   - Shows theme distribution (optional chart)
   - Quality distribution stats

2. **`RecommendedLineupCard.tsx`**

   - Shows recommended 8-10 demos
   - Each item shows reasoning
   - Organizer can click to view submission

3. **`SubmissionsWithAIList.tsx`**

   - List of all submissions with AI data
   - Shows tags, scores, summaries
   - Filterable by tags
   - Sortable by scores

4. **`AITagBadge.tsx`**

   - Displays individual tags
   - Color-coded by category
   - Clickable for filtering

5. **`AIScoreIndicator.tsx`**

   - Visual score indicator (0-1)
   - Color-coded (green/yellow/red)
   - Tooltip with breakdown

6. **`SimilarSubmissionsAlert.tsx`**
   - Alerts when duplicates detected
   - Shows comparison view

**Integration:**

- Add "AI Review" tab to `src/app/admin/[eventId]/components/AdminSidebar.tsx`
- Add route handling in event admin layout

### 4.5 No Risk to Existing Flows

**Critical Design Principle**: This feature is **purely advisory** and does not affect existing submission workflows:

- Does NOT auto-approve or reject submissions
- Does NOT modify submission status
- Does NOT block submission creation
- Does NOT interfere with manual review process
- Organizers maintain full control

AI data is stored alongside submissions but doesn't change core behavior. Organizers can:

- Ignore AI recommendations entirely
- Use AI insights to inform decisions
- Mix AI suggestions with manual curation

## 5. Implementation Plan

Time estimates reflect the 2-3 hours allowed for this task.

### Phase 1: Schema & Backend (45-60 minutes)

1. **Database Schema** (15 minutes)

   - Add new Prisma fields to `Submission` model
   - Create migration
   - Update TypeScript types

2. **Mock AI Analyzer** (20 minutes)

   - Create `src/server/ai/analyzer.ts`
   - Implement `mockAnalyzeEvent` function
   - Add helper functions for tag/stage/audience generation
   - Write basic tests

3. **tRPC Endpoints** (20 minutes)

   - Create `submissionAiRouter`
   - Implement `analyzeEvent` mutation
   - Implement `getEventSummary` query
   - Implement `getRecommendedLineup` query
   - Add to main router

4. **Error Handling** (5 minutes)
   - Add try-catch blocks
   - Return meaningful error messages
   - Log errors for debugging

### Phase 2: UI Components (60-75 minutes)

1. **AI Review Tab** (20 minutes)

   - Create `AIReviewTab.tsx`
   - Add to admin sidebar
   - Set up basic layout

2. **Event Summary Card** (15 minutes)

   - Display event summary text
   - Show theme distribution (simple list, chart optional)
   - Show quality stats

3. **Recommended Lineup** (15 minutes)

   - Display recommended submissions
   - Show reasoning for each
   - Link to submission details

4. **Submissions List with AI Data** (20 minutes)

   - Display all submissions with tags
   - Show AI scores
   - Add tag filtering
   - Add sorting by score

5. **Empty States** (5 minutes)
   - "No AI analysis yet" message
   - "Run AI Review" button
   - Loading states

### Phase 3: Polish & Documentation (30 minutes)

1. **UI Polish** (10 minutes)

   - Consistent styling
   - Proper spacing
   - Responsive design

2. **Error States** (10 minutes)

   - Handle API failures
   - Show user-friendly messages
   - Allow retry

3. **Documentation** (10 minutes)
   - Update PRD with implementation details
   - Document API shape
   - Note future enhancements (real AI API)

**Total: 2.5-3 hours**

### Future Enhancements (Not in Scope)

1. **Real AI Integration**

   - Replace mock with Claude/OpenAI API
   - Implement structured output parsing
   - Add cost tracking

2. **Advanced Visualizations**

   - Interactive tag distribution charts
   - Quality score histograms
   - Timeline of submissions

3. **Learning System**

   - Track which recommended submissions were confirmed
   - Improve recommendations over time
   - A/B test different scoring algorithms

4. **Batch Operations**

   - "Approve all recommended" (with confirmation)
   - "Flag all low-quality"
   - Bulk tag editing

5. **Cross-Event Analytics**
   - HQ dashboard for trends
   - Chapter comparison
   - Historical analysis

## 6. Success Metrics

### 6.1 Organizer Adoption

**Metric**: Percentage of events where organizers click "Run AI Review"

**Target**: 80% of events use AI Review within first month

**Measurement**: Track `analyzeEvent` mutation calls per event

**Why It Matters**: If organizers don't use it, the feature isn't solving their problem.

### 6.2 Review Time Reduction

**Metric**: Self-reported reduction in manual review time

**Target**: 40% reduction in time to curate final lineup

**Measurement**: Survey organizers: "How much time did AI Review save you?"

**Why It Matters**: The core value prop is efficiency.

### 6.3 Balanced Demo Lineup

**Metric**: Increase in thematic diversity across selected demos

**Target**: Events using AI Review have 30% more tag diversity in final lineup

**Measurement**: Compare tag distribution of confirmed demos (with vs without AI Review)

**Why It Matters**: Better curation leads to better events.

### 6.4 Submission Quality Insights

**Metric**: Percentage of low-signal submissions flagged

**Target**: 90% of submissions with insufficient detail are correctly flagged

**Measurement**: Compare AI flags with organizer manual flags

**Why It Matters**: Helps organizers focus on quality submissions.

### 6.5 Cross-Chapter Consistency

**Metric**: Standardized metadata enabling global trends analysis

**Target**: 100% of analyzed events have consistent tag schema

**Measurement**: Query database for tag consistency across events

**Why It Matters**: Enables HQ to understand community trends.

### Measurement Approach

- **Analytics Events**: Track when organizers use AI Review, which features they use
- **Database Logging**: Store analysis timestamps, scores, tags for historical analysis
- **User Surveys**: Periodic feedback from organizers
- **A/B Testing**: (Future) Compare events with/without AI Review enabled

## 7. Risks & Mitigations

### 7.1 AI Bias / Hallucination

**Risk**: AI might generate incorrect tags, scores, or recommendations, leading organizers astray.

**Mitigation**:

- **Human in the loop**: AI never auto-approves/rejects
- **Clear UI labeling**: "AI Suggestions Only" prominently displayed
- **Override capability**: Organizers can ignore or correct AI data
- **Transparency**: Show reasoning for recommendations
- **Continuous improvement**: Collect feedback and refine prompts

### 7.2 Cost Concerns

**Risk**: AI API calls can be expensive at scale (100+ submissions per event).

**Mitigation**:

- **On-demand only**: Analysis runs only when organizer clicks "Run AI Review"
- **Batch processing**: Analyze all submissions in a single API call (more efficient)
- **Mock for assignment**: Use mock implementation to avoid costs during development
- **Rate limiting**: Limit how often analysis can be re-run
- **Cost tracking**: Monitor API usage and set budgets
- **Model selection**: Use cost-effective models (Claude Haiku, GPT-3.5-turbo) for initial version

**Cost Estimate**:

- Batch analysis of 50 submissions: ~$0.50-1.00 with Claude Sonnet
- Per-event cost is manageable if used on-demand

### 7.3 Inconsistent Formatting in Submissions

**Risk**: Submissions have varying quality, length, and format, making AI analysis unreliable.

**Mitigation**:

- **Preprocessing**: Trim, sanitize, normalize text before sending to AI
- **Robust prompts**: Design prompts that handle edge cases (very short descriptions, missing fields)
- **Fallback values**: If analysis fails, show "Unable to analyze" rather than breaking
- **Validation**: Flag submissions with insufficient data before analysis
- **Manual override**: Allow organizers to manually add tags if AI fails

### 7.4 Complex UI

**Risk**: Too much information overwhelms organizers, making the feature hard to use.

**Mitigation**:

- **Start simple**: MVP focuses on summary, tags, recommended lineup
- **Progressive disclosure**: Hide advanced features initially
- **Clear hierarchy**: Most important info (recommended lineup) at top
- **Optional visuals**: Charts are nice-to-have, not required
- **User testing**: Get feedback and iterate

### 7.5 Future Scalability

**Risk**: As the system grows, AI analysis might become slow or expensive.

**Mitigation**:

- **`aiMetadata` JSON field**: Ensures future extensibility without schema changes
- **Modular AI service**: Easy to swap models or add new analysis types
- **Caching**: Cache analysis results (only re-run when submissions change)
- **Queue system**: (Future) Use job queue for high-volume events
- **Incremental analysis**: Only analyze new/changed submissions

### 7.6 Data Privacy

**Risk**: Sending submission data to external AI APIs raises privacy concerns.

**Mitigation**:

- **Opt-in**: Make AI Review optional per event
- **Data usage policy**: Use AI providers that don't train on user data (Anthropic, OpenAI with data controls)
- **Transparency**: Clearly communicate what data is sent to AI
- **Self-hosted option**: (Future) Consider self-hosted models for sensitive data

### 7.7 Integration Complexity

**Risk**: Adding AI analysis adds complexity to the codebase.

**Mitigation**:

- **Separate module**: Keep AI logic in `src/server/ai/` directory
- **Clear abstractions**: Well-defined interfaces for AI service
- **Comprehensive error handling**: Graceful degradation if AI fails
- **Feature flag**: Allow enabling/disabling AI Review
- **Good documentation**: Document API shape and usage

## 8. Alternative Approaches Considered

### 8.1 Automatic Per-Submission Scoring (Rejected)

**Approach**: Score each submission automatically when created (like original PRD).

**Why Rejected**:

- Less valuable than event-level curation
- More expensive (API call per submission)
- Doesn't address curation/balance problem
- Less aligned with AI Collective's mission

### 8.2 Rule-Based Tagging (Rejected)

**Approach**: Use keyword matching and rules to generate tags.

**Why Rejected**:

- Less accurate than AI
- Doesn't understand context
- Hard to maintain as new themes emerge
- Can't generate summaries or recommendations

### 8.3 Community Voting (Rejected)

**Approach**: Let submitters or community vote on submissions.

**Why Rejected**:

- Different use case (crowdsourcing vs curation)
- Doesn't help organizers understand event "shape"
- Not aligned with organizer workflow

### 8.4 Hybrid Approach (Future Consideration)

**Approach**: Combine automatic lightweight scoring with on-demand comprehensive analysis.

**Status**: Consider for Phase 2 if initial AI Review shows promise. Could add quick per-submission scores while keeping full analysis on-demand.

## 9. Conclusion

The **AI Submission Review & Curation Assistant** addresses a critical pain point for scaling Demo Night globally: helping organizers efficiently curate balanced, diverse event lineups. By providing event-level insights, auto-tagging, recommended lineups, and duplicate detection, this feature:

1. **Saves Time**: Organizers understand event composition in minutes, not hours
2. **Improves Quality**: Better curation leads to more engaging events
3. **Enables Scaling**: New organizers get guidance, HQ gets insights
4. **Stays Human-Centered**: AI assists but never decides

The feature is technically feasible, fits within the existing architecture, and can be implemented incrementally. The main risks (cost, accuracy, complexity) are manageable with proper mitigation strategies.
