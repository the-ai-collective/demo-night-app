# Quick Start: Match Mode & Judge Voting

## 🚀 Quick Deploy (3 Steps)

### 1. Run the Migration

```bash
# Start your database first (Docker Desktop must be running)
bash start-database.sh

# Run the migration
yarn db:migrate:deploy

# Generate Prisma Client
yarn prisma generate
```

### 2. Build & Run

```bash
# Development
yarn dev

# Production
yarn build && yarn start
```

### 3. Deploy to Vercel (Optional)

```bash
git add .
git commit -m "Add 1v1 match mode and judge voting"
git push origin main
```

Vercel will automatically run migrations and deploy. ✅

---

## 🎮 Using Match Mode

### Admin: Create a Match

1. Go to `/admin/[eventId]`
2. Add the Match Mode tab (see integration below)
3. Select two startups
4. Click "Create Match"
5. Click "Start Match" to begin voting
6. Click "Close Voting" to see the winner

### Admin: Make Someone a Judge

**Option 1: Prisma Studio**
```bash
yarn db:studio
```
Then navigate to User table and set `isJudge = true`

**Option 2: SQL**
```sql
UPDATE "User" SET "isJudge" = true WHERE email = 'judge@example.com';
```

### Attendees: Vote in a Match

When a match is active, attendees will see the MatchVoting component with two options. They click to vote!

---

## 🔌 Integration (Copy-Paste These)

### Add Match Mode Tab to Admin Panel

**File: `src/app/admin/[eventId]/page.tsx` or wherever you define tabs**

```tsx
import { MatchModeTab } from "./components/MatchMode/MatchModeTab";

// Add to your tabs configuration:
const tabs = [
  // ... existing tabs
  {
    id: "matches",
    label: "Match Mode",
    component: <MatchModeTab eventId={eventId} />
  }
];
```

### Add Match Voting to Attendee View

**File: `src/app/(attendee)/[eventUrl]/page.tsx` or workspace component**

```tsx
import { MatchVoting } from "../components/MatchVoting";

// Inside your component:
export function AttendeeView({ eventId, attendee }: Props) {
  // Check if user is a judge (you'll need to fetch current user)
  const { data: currentUser } = api.user.getCurrent.useQuery();
  const isJudge = currentUser?.isJudge ?? false;

  // Check if event has match mode enabled
  const { data: event } = api.event.get.useQuery({ eventId });

  return (
    <div>
      {event?.oneVsOneMode && (
        <MatchVoting
          eventId={eventId}
          attendee={attendee}
          isJudge={isJudge}
        />
      )}

      {/* Rest of your existing components */}
    </div>
  );
}
```

### Enable Match Mode for an Event

**Option 1: Prisma Studio**
```bash
yarn db:studio
```
Navigate to Event table and set `oneVsOneMode = true`

**Option 2: SQL**
```sql
UPDATE "Event" SET "oneVsOneMode" = true WHERE id = '[your-event-id]';
```

---

## ⚠️ Important: Fix Award ID

The MatchVoting component uses a placeholder `awardId: "match-vote"`.

**Quick Fix:**

1. Create a special award called "Match Vote" in your database, OR
2. Modify `src/app/(attendee)/components/MatchVoting/index.tsx`:

```tsx
// Add this near the top of the component
const { data: awards } = api.award.all.useQuery({ eventId });
const defaultAward = awards?.[0]; // or find a specific one

// Then in handleVote function:
upsertVote.mutate({
  eventId,
  attendeeId: attendee.id,
  awardId: defaultAward?.id ?? "match-vote", // Use actual award ID
  demoId,
  matchId: activeMatch.id,
  voteType: isJudge ? "judge" : "audience",
});
```

---

## 📊 How Weighted Voting Works

**Formula:**
```
Final Score = (Audience Votes / Total Audience) × 50%
            + (Judge Votes / Total Judge) × 50%
```

**Example:**
- Startup A: 30 audience votes, 3 judge votes
- Startup B: 20 audience votes, 2 judge votes
- Total: 50 audience, 5 judges

**Startup A Score:**
- Audience: (30/50) × 0.5 = 0.30
- Judge: (3/5) × 0.5 = 0.30
- **Total: 0.60 (60%)**

**Startup B Score:**
- Audience: (20/50) × 0.5 = 0.20
- Judge: (2/5) × 0.5 = 0.20
- **Total: 0.40 (40%)**

**Winner: Startup A** 🏆

---

## 🧪 Testing Locally

```bash
# 1. Start database
bash start-database.sh

# 2. Run migration
yarn db:migrate

# 3. Seed database (optional)
yarn db:seed

# 4. Start dev server
yarn dev

# 5. Open Prisma Studio to create test data
yarn db:studio
```

Then:
1. Mark a user as judge in Prisma Studio
2. Create a match in admin panel
3. Vote as both regular user and judge
4. Close voting and see weighted results

---

## 🎯 API Reference

### Match Endpoints

```typescript
// Get all matches
api.match.all.useQuery({ eventId })

// Get single match
api.match.get.useQuery({ matchId })

// Create match
api.match.create.useMutation({
  eventId,
  startupAId,
  startupBId,
  roundType: "Round 1",
  votingWindow: 300
})

// Start match
api.match.start.useMutation({ matchId })

// Close voting
api.match.closeVoting.useMutation({ matchId })

// Get results
api.match.getResults.useQuery({ matchId })

// Delete match
api.match.delete.useMutation({ matchId })
```

### Vote Endpoints (Extended)

```typescript
// Vote in a match
api.vote.upsert.useMutation({
  eventId,
  attendeeId,
  awardId,
  demoId,
  matchId,
  voteType: "audience" | "judge"
})

// Get match votes
api.vote.getMatchVotes.useQuery({ matchId })
```

---

## ✅ Checklist

- [ ] Database migration run
- [ ] Prisma Client generated
- [ ] Match Mode tab added to admin panel
- [ ] MatchVoting component added to attendee view
- [ ] At least one user marked as judge (for testing)
- [ ] Created a test match
- [ ] Voted as audience and judge
- [ ] Verified weighted scoring works
- [ ] Deployed to Vercel (optional)

---

## 🆘 Troubleshooting

**Migration fails:**
- Make sure Docker Desktop is running
- Check that database is accessible at `localhost:5432`
- Try `yarn db:push` for development

**Components not found:**
- Run `yarn prisma generate`
- Restart your dev server

**Votes not recording:**
- Check that you have valid awards in the database
- Update the `awardId` in MatchVoting component
- Check browser console for errors

**Vercel deployment fails:**
- Make sure `DATABASE_URL` and `DATABASE_URL_NON_POOLING` are set
- Check build logs for migration errors
- Verify Prisma version compatibility

---

## 📚 More Info

See [MATCH_MODE_IMPLEMENTATION.md](./MATCH_MODE_IMPLEMENTATION.md) for detailed technical documentation.
