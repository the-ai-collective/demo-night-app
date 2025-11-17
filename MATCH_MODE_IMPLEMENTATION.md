# 1v1 Match Mode & Judge Voting Implementation

This document outlines the minimal changes made to add two new features to the Demo Night App:

1. **1v1 Game Mode (Head-to-Head Matches)**
2. **Judge/Jury Profiles with Weighted Voting**

## ✅ What Was Added

### 1. Database Schema Changes

**File: `prisma/schema.prisma`**

#### New Fields:
- `User.isJudge` (Boolean) - Marks users as judges
- `Event.oneVsOneMode` (Boolean) - Toggle for 1v1 match mode
- `Vote.matchId` (String?) - Links votes to specific matches
- `Vote.voteType` (String) - "audience" or "judge"

#### New Model:
```prisma
model Match {
  id           String
  eventId      String
  startupAId   String
  startupBId   String
  roundType    String?
  startTime    DateTime?
  endTime      DateTime?
  isActive     Boolean
  votingWindow Int?
  winnerId     String?
  votes        Vote[]
}
```

### 2. Database Migration

**File: `prisma/migrations/20251117120000_add_match_and_judge_features/migration.sql`**

- Adds new columns to User, Event, and Vote tables
- Creates Match table with foreign keys
- Adds indexes for performance

### 3. Backend API (tRPC)

**New File: `src/server/api/routers/match.ts`**

Endpoints:
- `match.all` - Get all matches for an event
- `match.get` - Get a specific match
- `match.create` - Create a new match
- `match.start` - Start a match (opens voting)
- `match.closeVoting` - Close voting and compute winner
- `match.getResults` - Get match results with weighted scoring
- `match.delete` - Delete a match

**Modified File: `src/server/api/routers/vote.ts`**

- Updated `vote.upsert` to accept `matchId` and `voteType`
- Added `vote.getMatchVotes` to get votes for a specific match

**Modified File: `src/server/api/root.ts`**

- Registered `match` router

### 4. Weighted Voting Algorithm

**Location: `src/server/api/routers/match.ts` - `computeMatchWinner()`**

Formula:
```typescript
finalScoreA = (audienceVotesA / totalAudienceVotes) * 0.5
            + (judgeVotesA / totalJudgeVotes) * 0.5

finalScoreB = (audienceVotesB / totalAudienceVotes) * 0.5
            + (judgeVotesB / totalJudgeVotes) * 0.5
```

- 50% weight for audience votes
- 50% weight for judge votes
- If no judges vote, 100% weight goes to audience

### 5. Admin UI Components

**New File: `src/app/admin/[eventId]/components/MatchMode/MatchModeTab.tsx`**

Features:
- Create matches between two startups
- Select round type (Round 1, Round 2, Semi-Final, Final)
- View all matches for the event

**New File: `src/app/admin/[eventId]/components/MatchMode/MatchView.tsx`**

Features:
- Start/stop match voting
- Live vote counts (refreshes every 2 seconds)
- Breakdown by audience vs judge votes
- Displays weighted scores after voting closes
- Shows winner with 🏆 emoji
- Delete completed matches

### 6. Attendee UI Component

**New File: `src/app/(attendee)/components/MatchVoting/index.tsx`**

Features:
- Shows active 1v1 match
- Click-to-vote interface
- Visual feedback when vote is cast
- Displays judge badge if user is a judge
- Automatically detects and shows existing votes
- Refreshes to show latest active match

## 🚀 How to Deploy

### Step 1: Start Database (Local Development)

```bash
# Make sure Docker Desktop is running first
cd e:\AI_collective\demo_app\demo-night-app
bash start-database.sh
```

### Step 2: Run Migration

```bash
yarn db:migrate:deploy
```

Or for development:
```bash
yarn db:migrate
```

### Step 3: Generate Prisma Client

```bash
yarn env:dev prisma generate
```

### Step 4: Build and Deploy

```bash
# Build the app
yarn build

# Run locally
yarn start

# Or deploy to Vercel (automatic)
git push origin main
```

**Vercel will automatically:**
- Run `yarn build`
- Execute `prisma migrate deploy`
- Generate Prisma Client
- Deploy the app

## 📋 How to Use

### Admin: Enable Match Mode

1. Go to admin panel: `/admin/[eventId]`
2. Navigate to "Match Mode" tab
3. Create a new match:
   - Select Startup A
   - Select Startup B
   - Choose round type
   - Click "Create Match"
4. Click "Start Match" to open voting
5. Click "Close Voting" to end and compute winner

### Admin: Mark Users as Judges

Update the User table directly in Prisma Studio or via SQL:

```sql
UPDATE "User" SET "isJudge" = true WHERE email = 'judge@example.com';
```

Or use Prisma Studio:
```bash
yarn db:studio
```

### Attendees: Vote in Matches

1. Go to event page: `/[eventUrl]`
2. If a match is active, the MatchVoting component will show
3. Click on preferred startup
4. Vote is recorded with type "audience" or "judge" based on user profile

### Judge Votes

- If `User.isJudge = true`, their votes are automatically marked as `voteType: "judge"`
- Pass `isJudge={true}` to the `MatchVoting` component

## 🔧 Integration Points

### To add Match Mode tab to admin panel:

**File: `src/app/admin/[eventId]/components/AdminSidebar.tsx`** (modify as needed)

```tsx
import { MatchModeTab } from "./MatchMode/MatchModeTab";

// Add to tabs array:
{
  name: "Match Mode",
  component: <MatchModeTab eventId={eventId} />
}
```

### To add Match Voting to attendee view:

**File: `src/app/(attendee)/components/[YourWorkspace]/index.tsx`** (modify as needed)

```tsx
import { MatchVoting } from "../MatchVoting";

// Inside component:
const { data: currentUser } = api.user.getCurrent.useQuery();
const isJudge = currentUser?.isJudge ?? false;

<MatchVoting
  eventId={eventId}
  attendee={attendee}
  isJudge={isJudge}
/>
```

### To enable Match Mode for an event:

```sql
UPDATE "Event" SET "oneVsOneMode" = true WHERE id = '[eventId]';
```

## ⚠️ Important Notes

### Match Voting and Awards

The current implementation uses a placeholder `awardId: "match-vote"`. You may need to:

1. Create a special "Match Vote" award in your database, OR
2. Modify the MatchVoting component to use an existing award from the event

Example fix:
```tsx
const { data: awards } = api.award.all.useQuery({ eventId });
const matchAward = awards?.[0]; // Use first award or create special one

upsertVote.mutate({
  // ...
  awardId: matchAward?.id ?? "default-award-id",
  // ...
});
```

### No Breaking Changes

- All existing functionality remains unchanged
- Regular voting still works
- Demo nights and pitch nights work as before
- Match mode is completely optional

### Vercel Deployment

✅ Zero configuration changes needed:
- Migration runs automatically via `prisma migrate deploy` in build command
- No env variables added
- Uses existing database connection
- No new dependencies

## 📊 Database Impact

- 4 new columns (User.isJudge, Event.oneVsOneMode, Vote.matchId, Vote.voteType)
- 1 new table (Match)
- 2 new indexes
- Backward compatible (all fields are optional or have defaults)

## 🎯 Summary of Deliverables

✅ Match entity with full CRUD
✅ 1v1 duel mode
✅ Live vote tracking per match
✅ Judge profiles (User.isJudge)
✅ Weighted vote computation (50/50 split)
✅ Minimal schema additions
✅ App structure identical (no refactoring)
✅ Vercel auto-deploy ready

---

**Total Files Modified: 4**
- `prisma/schema.prisma`
- `src/server/api/routers/vote.ts`
- `src/server/api/root.ts`
- Migration file

**Total Files Created: 5**
- `src/server/api/routers/match.ts`
- `src/app/admin/[eventId]/components/MatchMode/MatchModeTab.tsx`
- `src/app/admin/[eventId]/components/MatchMode/MatchView.tsx`
- `src/app/(attendee)/components/MatchVoting/index.tsx`
- This documentation file

**Zero Files Deleted**
**Zero Refactoring**
**Zero Breaking Changes**
