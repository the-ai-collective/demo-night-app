# Feature Proposal: Predictions & Leaderboard System

## Problem

During demo nights, attendees watch presentations but have limited ways to engage beyond passive observation and post-event voting. This creates several issues:

1. **Low engagement during the event**: Attendees may lose focus between presentations with no interactive elements to maintain their attention
2. **Limited gamification**: There's no competitive or game-like element that makes the experience more fun and memorable
3. **Missed insights**: We don't capture attendees' predictions about which demos will win awards, which could provide valuable data about first impressions vs. final outcomes
4. **Lack of recognition**: Attendees who are good at identifying winning demos have no way to showcase this skill or be recognized for it

## Solution

Implement a **Predictions & Leaderboard System** that allows attendees to predict award winners before voting closes, with a competitive leaderboard to recognize top predictors.

### Core Features

#### 1. **Pre-Event Predictions**
- Attendees can predict which demos will win each award category
- Each prediction is made with a budget allocation system ($100k virtual budget per award)
- Predictions are locked before the voting/results phase to ensure fairness
- Simple, intuitive UI integrated into the event workspace

#### 2. **Scoring System**
- Attendees earn points based on prediction accuracy
- Scoring formula rewards both getting the winner correct and ranking demos accurately
- Points calculated after award winners are announced
- Transparent scoring visible to all participants

#### 3. **Dynamic Leaderboard**
- Real-time leaderboard showing top predictors
- Badge system to recognize achievement levels:
  - 🔮 **Oracle** (90%+ accuracy)
  - 🥇 **Gold Predictor** (75-89% accuracy)
  - 🥈 **Silver Predictor** (60-74% accuracy)
  - 🥉 **Bronze Predictor** (45-59% accuracy)
  - 🌟 **Novice** (< 45% accuracy)
- Detailed score breakdown showing predictions vs. actual results

#### 4. **Predictions Workspace**
- Dedicated phase in the event timeline
- Clean interface for making predictions with budget allocation sliders
- Shows all awards and available demos
- Confirmation before locking predictions

### Technical Implementation

**Database Schema:**
```prisma
model Prediction {
  id         String   @id @default(cuid())
  amount     Int      // Budget allocated

  award      Award    @relation(...)
  demo       Demo     @relation(...)
  attendee   Attendee @relation(...)
  event      Event    @relation(...)
}

model PredictionScore {
  id         String   @id @default(cuid())
  score      Float    // Calculated accuracy score
  rank       Int      // Leaderboard position

  attendee   Attendee @relation(...)
  event      Event    @relation(...)
}
```

**API Endpoints (tRPC):**
- `prediction.create` - Submit predictions for an award
- `prediction.getByAttendee` - Retrieve attendee's predictions
- `prediction.calculateScores` - Admin action to calculate all scores
- `prediction.getLeaderboard` - Get ranked list of predictors

**UI Components:**
- `PredictionsWorkspace` - Main prediction interface
- `PredictionLeaderboard` - Display scores and rankings
- Budget allocation sliders with real-time validation

**Validation & Business Logic:**
- Budget validation enforced on both client and server
- Total budget per award must equal $100k (prevents over/under allocation)
- Predictions locked once voting phase begins
- Phase-based access control (predictions only available during Predictions phase)
- Idempotent score calculation to prevent duplicate processing

**Integration Points:**
- New `EventPhase.Predictions` added to event lifecycle (between Demos and Voting)
- Predictions workspace added to attendee router
- Admin controls in ControlCenter for phase transitions
- Score calculation triggered when Results phase begins

**Edge Cases Handled:**
- Tied predictions (budget split between demos handled gracefully)
- Missing winner data (score calculation skips incomplete awards)
- Late arrivals (can make predictions until phase ends)
- Budget rounding errors (server validation ensures exact $100k)

## User Stories

1. **As an attendee**, I want to predict which demos will win each award before voting closes, so that I can actively engage with presentations rather than passively watching and test my judgment skills.

2. **As an event organizer**, I want to gamify the attendee experience with a predictions system, so that participants stay engaged throughout the entire event and have more fun, leading to better retention and word-of-mouth.

3. **As a competitive attendee**, I want to see my ranking on a live leaderboard compared to other participants, so that I can showcase my ability to identify winning demos and earn recognition for my predictive skills.

4. **As an admin**, I want to view prediction analytics and consensus data, so that I can understand which demos created strong first impressions versus those that won after deeper consideration, providing insights for future event planning.

5. **As a demo presenter**, I want attendees to be highly engaged and paying close attention to my presentation, so that my demo receives thoughtful evaluation and I get quality feedback from genuinely interested participants.

## Justification

### Value to Attendees
1. **Increased Engagement**: Gives attendees something active to do during the event, keeping them focused on evaluating each demo
2. **Gamification**: Adds a fun, competitive element that makes the event more memorable
3. **Recognition**: Top predictors get public recognition via leaderboard and badges
4. **Learning**: Comparing predictions vs. results helps attendees calibrate their evaluation skills

### Value to Organizers
1. **Higher Participation**: More engaging events lead to better attendee retention and word-of-mouth
2. **Data Insights**: Prediction data reveals which demos made strong first impressions vs. which won after reflection
3. **Community Building**: Leaderboard creates talking points and friendly competition among regular attendees
4. **Differentiation**: Unique feature that sets these demo nights apart from competitors

### Value to Demoing Companies
1. **Attention**: Attendees pay closer attention to presentations when they're making predictions
2. **Feedback Loop**: Prediction patterns can reveal which aspects of a demo resonate immediately vs. on reflection
3. **Fair Evaluation**: More engaged attendees provide better quality feedback

### Why This Feature Makes Sense
- **Low Implementation Complexity**: Builds on existing award and demo infrastructure
- **High Impact**: Transforms passive watching into active participation
- **Reusable**: Once implemented, works for every future event with minimal maintenance
- **Scalable**: System handles any number of awards, demos, or attendees
- **Non-Intrusive**: Optional feature that doesn't disrupt core event flow

### Success Metrics
- **Adoption Rate**: % of attendees who make predictions
- **Completion Rate**: % who predict for all awards vs. partial
- **Engagement Time**: Time spent in predictions workspace
- **Correlation Analysis**: How well predictions match final voting outcomes
- **Retention**: Do events with predictions see better attendee return rates?

## Implementation Plan

### Phase 1: MVP - Core Predictions System (24 hours)

**1. Database Schema & Migrations (3 hours)**
- Create Prediction and PredictionScore models in Prisma schema
- Add relations to Event, Award, Demo, and Attendee models
- Add `EventPhase.Predictions` to phase enum
- Create and test migration files
- Verify schema in development database

**2. tRPC API Router Implementation (6 hours)**
- `prediction.upsert` - Create/update predictions with budget validation (2 hours)
- `prediction.getByAttendee` - Fetch attendee's predictions (1 hour)
- `prediction.calculateScores` - Calculate accuracy scores for all attendees (2 hours)
- `prediction.getLeaderboard` - Retrieve ranked predictor list (1 hour)
- Write comprehensive input validation using Zod schemas
- Add proper error handling and response types

**3. PredictionsWorkspace UI Component (10 hours)**
- Award selection tabs with demo lists (3 hours)
- Budget allocation interface with sliders/inputs (4 hours)
- Real-time budget validation and visual feedback (2 hours)
- Submission confirmation flow (1 hour)
- Responsive design for mobile and desktop
- Loading states and error handling

**4. Leaderboard Component (3 hours)**
- Display top predictors with scores
- Show user's current rank
- Badge level indicators
- Score breakdown tooltips

**5. Integration & Phase Management (2 hours)**
- Add Predictions phase to EventPhase enum and display logic
- Update admin ControlCenter to include Predictions phase button
- Add phase transition logic (Demos → Predictions → Voting)
- Update Workspaces router to render PredictionsWorkspace

**6. Testing & Debugging (5 hours)**
- Test prediction submission flow end-to-end
- Verify budget validation edge cases
- Test score calculation algorithm
- Test leaderboard ranking logic
- Fix bugs and polish UI

**Total Phase 1 Time: 29 hours**

### Phase 2: Enhanced Features & Polish (12 hours)

**1. Badge System Implementation (3 hours)**
- Define badge thresholds and icons
- Add badge display to leaderboard
- Badge assignment logic in score calculation

**2. Detailed Score Breakdowns (4 hours)**
- Show which predictions were correct/incorrect
- Display accuracy percentage per award
- Add visual indicators for wins/losses

**3. Consensus Predictions View (3 hours)**
- Admin-only view showing aggregated prediction data
- Shows which demos the crowd favors per award
- Useful for spotting potential upsets

**4. UI Polish & Animations (2 hours)**
- Smooth transitions between phases
- Confetti or celebration effects for high scorers
- Improved mobile experience

**Total Phase 2 Time: 12 hours**

### Phase 3: Historical Tracking (8 hours)

**1. Cross-Event Score History (4 hours)**
- Track prediction performance across multiple events
- All-time leaderboard for repeat attendees
- Personal stats dashboard

**2. Streak Tracking (2 hours)**
- Track consecutive accurate predictions
- Award streak badges

**3. Achievement System (2 hours)**
- Define achievements (e.g., "Perfect Score", "Underdog Picker")
- Achievement notifications

**Total Phase 3 Time: 8 hours**

### Phase 4: Social Features (6 hours)

**1. Prediction Sharing (3 hours)**
- Generate shareable prediction cards
- Social media integration

**2. Prediction Insights (3 hours)**
- Post-event analysis comparing predictions vs. votes
- Identify trends (e.g., "Most surprising winner")

**Total Phase 4 Time: 6 hours**

---

**Overall Estimated Time: 55 hours** (29 MVP + 12 enhancements + 8 historical + 6 social)

**Recommended Approach**: Ship Phase 1 MVP first, gather user feedback, then iterate with Phases 2-4 based on actual usage patterns and feature requests.

## Challenges & Mitigation Strategies

### Technical Challenges

**1. Budget Validation Complexity**
- **Challenge**: Ensuring exact $100k allocation across multiple demos with potential rounding errors
- **Mitigation**:
  - Client-side validation provides immediate feedback
  - Server-side validation as final authority
  - Store amounts as integers (cents) to avoid floating-point errors
  - Clear error messages showing current total vs. required total

**2. Race Conditions in Score Calculation**
- **Challenge**: Multiple admins might trigger score calculation simultaneously
- **Mitigation**:
  - Implement idempotency checks (skip if scores already calculated)
  - Use database transactions to ensure atomic updates
  - Add calculation status flag to Event model
  - Show clear UI feedback when calculation is in progress

**3. Performance with Large Events**
- **Challenge**: Score calculation for 100+ attendees across 5+ awards could be slow
- **Mitigation**:
  - Optimize database queries with proper indexes
  - Calculate scores asynchronously if needed
  - Cache leaderboard results with short TTL
  - Consider batch processing for very large events

### User Experience Challenges

**4. Budget Allocation Confusion**
- **Challenge**: Users may not understand the $100k budget allocation mechanic
- **Mitigation**:
  - Add onboarding tooltip explaining the concept
  - Provide "Equal Split" quick action button
  - Show real-time budget remaining indicator
  - Include example predictions in UI

**5. Low Initial Adoption**
- **Challenge**: Attendees might skip predictions if not familiar with the feature
- **Mitigation**:
  - Admin demos predictions feature at event kickoff
  - Send email reminders when Predictions phase begins
  - Make predictions workspace visually appealing and fun
  - Consider small incentives (e.g., "Top 3 predictors get recognition")

**6. Mobile Usability**
- **Challenge**: Budget sliders and multi-award interface may be cramped on mobile
- **Mitigation**:
  - Design mobile-first with touch-friendly controls
  - Use tabs/accordion to manage space
  - Test on various device sizes
  - Provide number input alternative to sliders

### Business Challenges

**7. Predictions May Spoil Award Suspense**
- **Challenge**: Leaderboard reveals predictions before winners announced
- **Mitigation**:
  - Keep individual predictions private until Results phase
  - Show only aggregated consensus data to admins
  - Display leaderboard only after all winners revealed
  - Make suspense part of the fun ("Who predicted best?")

**8. Feature Maintenance Overhead**
- **Challenge**: New feature adds complexity to codebase and event flow
- **Mitigation**:
  - Build with existing infrastructure (tRPC, Prisma patterns)
  - Write comprehensive tests for core logic
  - Document thoroughly in CLAUDE.md
  - Make feature optional (events can skip Predictions phase)
  - Reuse existing UI components where possible

**9. Scoring Algorithm Fairness**
- **Challenge**: Attendees might dispute scoring methodology
- **Mitigation**:
  - Make scoring formula transparent and documented
  - Show score breakdowns explaining how points were calculated
  - Allow attendees to view their prediction accuracy per award
  - Consider community feedback for algorithm improvements
  - Keep algorithm simple and easy to understand

## Conclusion

The Predictions & Leaderboard System addresses a clear gap in attendee engagement while providing valuable data and differentiation for the platform. With relatively low implementation complexity and high potential impact, this feature aligns well with the goal of creating the most engaging demo night experience possible.
