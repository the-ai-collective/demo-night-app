# Setup Instructions - Match Mode Features

## ⚠️ Important: Run from Correct Directory

All commands must be run from the project root directory:

```powershell
# Navigate to the project directory
cd E:\AI_collective\demo_app\demo-night-app

# Verify you're in the right place (should see package.json)
ls package.json
```

---

## 🐳 Step 1: Start Docker Desktop

**Before running any commands:**

1. Open **Docker Desktop** application on Windows
2. Wait for it to fully start (look for green "running" status)
3. Verify Docker is running:

```powershell
docker --version
```

---

## 📦 Step 2: Start the Database

```powershell
cd E:\AI_collective\demo_app\demo-night-app
bash start-database.sh
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- Redis HTTP interface on port 8079

**Verify it's running:**
```powershell
docker ps
```

You should see 3 containers running.

---

## 🗄️ Step 3: Run the Migration

```powershell
cd E:\AI_collective\demo_app\demo-night-app
yarn db:migrate:deploy
```

This will:
- Add `isJudge` field to User table
- Add `oneVsOneMode` field to Event table
- Add `matchId` and `voteType` fields to Vote table
- Create the new Match table

**Alternative for development:**
```powershell
yarn db:migrate
```

---

## 🔄 Step 4: Generate Prisma Client

```powershell
cd E:\AI_collective\demo_app\demo-night-app
yarn prisma generate
```

---

## 🚀 Step 5: Run the App

**Development mode:**
```powershell
cd E:\AI_collective\demo_app\demo-night-app
yarn dev
```

**Production mode:**
```powershell
cd E:\AI_collective\demo_app\demo-night-app
yarn build
yarn start
```

The app will be available at: `http://localhost:3000`

---

## 🧪 Step 6: Test the Features

### Create Test Data

Open Prisma Studio:
```powershell
cd E:\AI_collective\demo_app\demo-night-app
yarn db:studio
```

This opens a GUI at `http://localhost:5555`

**Do the following:**

1. **Mark a user as judge:**
   - Go to User table
   - Find a user (or create one)
   - Set `isJudge = true`

2. **Enable match mode for an event:**
   - Go to Event table
   - Find your event
   - Set `oneVsOneMode = true`

3. **Create some demos** (if you don't have any):
   - Go to Demo table
   - Create at least 2 demos for your event

### Test Match Creation

1. Go to admin panel: `http://localhost:3000/admin/[eventId]`
2. You'll need to integrate the MatchMode tab (see integration guide below)
3. Create a match between two startups
4. Start the match
5. Vote as both judge and regular user
6. Close voting and see results

---

## 🔌 Integration Guide

### Add Match Mode Tab to Admin

**Option 1: Quick Test (Temporary)**

Create a test page at `src/app/admin/[eventId]/matches/page.tsx`:

```tsx
import { MatchModeTab } from "../components/MatchMode/MatchModeTab";

export default function MatchesPage({
  params,
}: {
  params: { eventId: string };
}) {
  return <MatchModeTab eventId={params.eventId} />;
}
```

Then visit: `http://localhost:3000/admin/[eventId]/matches`

**Option 2: Add to Existing Tabs**

Find where your admin tabs are defined (likely in `src/app/admin/[eventId]/page.tsx` or `ClientEventDashboard.tsx`):

```tsx
import { MatchModeTab } from "./components/MatchMode/MatchModeTab";

// Add to your tabs array:
const tabs = [
  // ... existing tabs
  {
    id: "matches",
    label: "Match Mode",
    icon: /* your icon */,
    component: <MatchModeTab eventId={eventId} />
  }
];
```

### Add Match Voting to Attendee View

Find your attendee view component and add:

```tsx
import { MatchVoting } from "~/app/(attendee)/components/MatchVoting";

// Inside your component, check if match mode is enabled:
const { data: event } = api.event.get.useQuery({ eventId });
const { data: currentUser } = api.user.getCurrent.useQuery(); // You'll need to add this endpoint
const isJudge = currentUser?.isJudge ?? false;

return (
  <div>
    {event?.oneVsOneMode && (
      <MatchVoting
        eventId={eventId}
        attendee={attendee}
        isJudge={isJudge}
      />
    )}

    {/* Rest of your components */}
  </div>
);
```

---

## ⚠️ Important: Award ID Fix

The MatchVoting component needs a valid `awardId`.

**Quick fix - Create a special award:**

In Prisma Studio:
1. Go to Award table
2. Create new award:
   - `name`: "Match Vote"
   - `description`: "Vote in match mode"
   - `eventId`: [your event id]
   - `index`: 999
   - `votable`: true

**Or modify the component:**

Edit `src/app/(attendee)/components/MatchVoting/index.tsx` at line ~32:

```tsx
// Add this query
const { data: awards } = api.award.all.useQuery({ eventId });
const matchAward = awards?.find(a => a.name === "Match Vote") ?? awards?.[0];

// Then in handleVote function, replace:
awardId: "match-vote",
// With:
awardId: matchAward?.id ?? "match-vote",
```

---

## 🎯 Quick Test Checklist

- [ ] Docker Desktop is running
- [ ] Database containers are running (`docker ps`)
- [ ] Migration completed successfully
- [ ] Prisma Client generated
- [ ] App starts without errors (`yarn dev`)
- [ ] Created at least one user with `isJudge = true`
- [ ] Created at least two demos in an event
- [ ] Set event `oneVsOneMode = true`
- [ ] Can access admin match mode page
- [ ] Can create a match
- [ ] Can start a match
- [ ] Can vote in a match
- [ ] Can close voting and see results

---

## 🆘 Troubleshooting

### "Cannot find package.json"
```powershell
# Make sure you're in the right directory
cd E:\AI_collective\demo_app\demo-night-app
pwd  # Should show: E:\AI_collective\demo_app\demo-night-app
```

### Docker not running
```powershell
# Start Docker Desktop application
# Wait for it to show "running" status
# Then retry: bash start-database.sh
```

### "Cannot reach database server"
```powershell
# Check if containers are running
docker ps

# If not, restart them
cd E:\AI_collective\demo_app\demo-night-app
docker-compose down
bash start-database.sh
```

### Migration fails
```powershell
# For development, you can use db:push instead
cd E:\AI_collective\demo_app\demo-night-app
yarn db:push
```

### TypeScript errors after migration
```powershell
# Regenerate Prisma Client
cd E:\AI_collective\demo_app\demo-night-app
yarn prisma generate

# Restart your dev server
# Stop with Ctrl+C, then:
yarn dev
```

### "Award not found" error in votes
See the "Award ID Fix" section above. You need to either:
1. Create a "Match Vote" award, OR
2. Modify the MatchVoting component to use an existing award

---

## 📚 Next Steps

Once everything is working:

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add match mode and judge voting features"
   git push origin main
   ```

2. **Set up production judges:**
   - Update production User records via Prisma Studio or SQL
   - Or create an admin UI to manage judge status

3. **Customize the UI:**
   - Adjust colors, styling
   - Add your branding
   - Customize round types

4. **Add real-time features (optional):**
   - WebSocket support for live vote updates
   - Push notifications for match start/end

---

## 📖 More Documentation

- **[MATCH_MODE_IMPLEMENTATION.md](./MATCH_MODE_IMPLEMENTATION.md)** - Technical details
- **[QUICKSTART_MATCH_MODE.md](./QUICKSTART_MATCH_MODE.md)** - API reference and examples
