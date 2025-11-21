# Demo Night App - Technical Specification

**Version:** 1.0
**Last Updated:** 2025-11-20
**Repository:** Demo Night App (DNA)

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Database Schema](#database-schema)
5. [API Specification](#api-specification)
6. [Authentication & Authorization](#authentication--authorization)
7. [State Management & Caching](#state-management--caching)
8. [User Workflows](#user-workflows)
9. [Event Lifecycle](#event-lifecycle)
10. [Configuration & Environment](#configuration--environment)
11. [Development Guide](#development-guide)

---

## Overview

Demo Night App is a full-stack Next.js application designed for managing interactive demo night events. It facilitates the entire event lifecycle from demo submissions through live presentations to audience feedback and voting.

### Key Capabilities

- **Demo Submission & Approval** - Public submission forms with admin review workflow
- **Real-time Event Control** - Admin dashboard for controlling live event flow
- **Audience Engagement** - Feedback collection, voting, and interaction tracking
- **Multiple Event Types** - Demo Night (traditional showcase) and Pitch Night (investment-style)
- **Analytics Dashboard** - Comprehensive metrics on engagement and outcomes
- **Hall of Fame** - Historical archive of past winners

### Project Structure

```
/src
  /app                    # Next.js App Router pages
    /(attendee)          # Attendee-facing event pages
    /(demoist)           # Demo presenter dashboard
    /(submission)        # Demo submission flow
    /admin               # Admin dashboard & controls
    /hall-of-fame        # Past winners showcase
    /api                 # API routes (tRPC, NextAuth)
  /server                # Backend logic
    /api                 # tRPC routers and configuration
    auth.ts              # NextAuth setup
    db.ts                # Prisma client
  /components            # React components
    /ui                  # shadcn/ui base components
  /lib                   # Utilities, types, branding
  /trpc                  # tRPC client configuration
/prisma
  schema.prisma          # Database schema
  /migrations            # Database migrations
```

---

## Technology Stack

### Core Framework

- **Next.js 14** - React framework with App Router
- **TypeScript** - Strict mode enabled, ES2022 target
- **React 18** - Server & Client Components

### Data Layer

- **PostgreSQL** - Primary database (via Neon/Vercel Postgres)
- **Prisma 5** - ORM and migration tool
- **Redis/Vercel KV** - Real-time event state cache

### API & State Management

- **tRPC (Next branch)** - Type-safe API layer
- **React Query** - Server state management (via tRPC)
- **SuperJSON** - Enhanced serialization (Date, Map, Set)
- **Zod** - Runtime schema validation

### Authentication

- **NextAuth.js 4** - Authentication framework
- **Google OAuth** - Production auth provider
- **Credentials** - Development-only test login

### UI Framework

- **Tailwind CSS 3** - Utility-first styling
- **shadcn/ui** - 20 Radix UI-based components
- **React Hook Form** - Form state & validation
- **nuqs** - URL state management

### Development Tools

- **ESLint** - Code linting with Next.js config
- **dotenv-cli** - Environment variable management
- **Prisma Studio** - Database GUI
- **csv-parse / react-csv** - CSV import/export

---

## Application Architecture

### Architecture Pattern

**Monolithic Full-Stack Application** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│            Next.js App Router (RSC)             │
├─────────────────────────────────────────────────┤
│  Client Components  │  Server Components        │
│  - Attendee UI      │  - Admin Dashboard        │
│  - Forms            │  - Analytics              │
│  - Interactive      │  - Data Fetching          │
├─────────────────────────────────────────────────┤
│         tRPC API Layer (Type-Safe)              │
│  - 8 Routers, 60+ Procedures                    │
│  - Zod Validation                               │
│  - Public & Protected Endpoints                 │
├─────────────────────────────────────────────────┤
│           Business Logic Layer                  │
│  - Event Management                             │
│  - Voting Logic                                 │
│  - Feedback Processing                          │
├─────────────────────────────────────────────────┤
│              Data Layer                         │
│  PostgreSQL (Prisma) │ Redis/KV (Real-time)    │
└─────────────────────────────────────────────────┘
```

### Routing Structure

**File**: `/src/app/`

#### Public Routes

| Route | Purpose |
|-------|---------|
| `/[eventId]` | Attendee event page with real-time updates |
| `/[eventId]/submit` | Public demo submission form |
| `/hall-of-fame` | Historical event winners |

#### Protected Routes (require auth)

| Route | Purpose |
|-------|---------|
| `/admin` | List all events |
| `/admin/[eventId]` | Event management dashboard (tabs: Control, Config, Demos, Attendees, Results, Submissions, Feedback) |
| `/admin/present` | Full-screen presentation mode |

#### Semi-Protected Routes

| Route | Purpose | Access Method |
|-------|---------|---------------|
| `/[eventId]/[demoId]` | Demo presenter dashboard | Requires demo secret |
| `/admin/[eventId]/submissions` | Submission review | Requires event secret |

### Component Architecture

#### UI Components (`/src/components/ui/`)

20 shadcn/ui components built on Radix UI primitives:

- **Layout**: `card`, `separator`, `scroll-area`, `resizable`, `sheet`, `sidebar`
- **Forms**: `button`, `input`, `textarea`, `checkbox`, `switch`, `select`, `form`, `label`
- **Overlays**: `dialog`, `alert-dialog`, `dropdown-menu`, `hover-card`, `tooltip`
- **Data**: `table`, `skeleton`

#### Workspace Components

Attendee experience is organized into phase-specific workspaces:

```typescript
// src/app/(attendee)/components/
PreWorkspace       // Event welcome & partners
DemosWorkspace     // Demo list with feedback forms
VotingWorkspace    // Award voting interface
ResultsWorkspace   // Winners display with confetti
RecapWorkspace     // Event feedback & survey
```

### tRPC Configuration

**File**: `/src/server/api/trpc.ts`

```typescript
// Context includes session and database
const createTRPCContext = async (opts) => ({
  session: await getServerAuthSession(),
  db: prisma,
});

// Procedures
publicProcedure      // No authentication required
protectedProcedure   // Requires valid NextAuth session
```

**Client Setup**:
- React Client: `/src/trpc/react.tsx` - Uses batched HTTP streaming
- Server Client: `/src/trpc/server.ts` - Direct server-side calls from RSC

**Endpoint**: `/api/trpc/[trpc]/route.ts`

---

## Database Schema

### Schema File

**File**: `/prisma/schema.prisma`

**Provider**: PostgreSQL
**Prisma Client**: Generated to `node_modules/.prisma/client`

### Core Entity Relationship Diagram

```
┌──────────┐        ┌──────────────┐        ┌──────────┐
│  Event   │◄───────┤  Submission  │        │  User    │
│          │        │              │        │          │
│ - id     │        │ - id         │        │ - id     │
│ - name   │        │ - status     │        │ - email  │
│ - date   │        │ - email      │        └──────────┘
│ - config │        └──────────────┘              │
│ - secret │                                      │
└────┬─────┘                                      │
     │                                      ┌─────┴──────┐
     │                                      │  Session   │
     ├──────────┬──────────┬────────────┐  │  Account   │
     │          │          │            │  └────────────┘
     ▼          ▼          ▼            ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│  Demo  │ │ Award  │ │ Attendee │ │EventFdbk │
│        │ │        │ │          │ └──────────┘
│ - id   │ │ - id   │ │ - id     │
│ - name │ │ - name │ │ - email  │
│ -secret│ │ -winner├─┤ - type   │
└───┬────┘ └───┬────┘ └────┬─────┘
    │          │           │
    └──────┬───┴───────┬───┘
           │           │
      ┌────▼────┐ ┌───▼─────┐
      │Feedback │ │  Vote   │
      │         │ │         │
      │-rating  │ │-demoId  │
      │-claps   │ │-amount  │
      │-comment │ └─────────┘
      └─────────┘
```

### Model Definitions

#### Event

The central entity representing a demo night event.

```prisma
model Event {
  id            String          @id @default(cuid())
  name          String
  date          DateTime
  url           String
  config        Json            // EventConfig type
  secret        String          @default(cuid())

  submissions   Submission[]
  demos         Demo[]
  attendees     Attendee[]
  awards        Award[]
  feedback      Feedback[]
  votes         Vote[]
  eventFeedback EventFeedback[]
}
```

**Config JSON Structure** (`EventConfig` type):
```typescript
{
  quickActions: QuickAction[]  // Custom action buttons
  partners: Partner[]           // Event sponsors/partners
  isPitchNight: boolean        // Event type flag
  surveyUrl?: string           // Post-event survey link
}
```

#### Submission

Demo submission requests awaiting admin review.

```prisma
model Submission {
  id          String           @id @default(cuid())
  eventId     String
  name        String
  tagline     String
  description String
  email       String
  url         String
  pocName     String
  demoUrl     String?
  status      SubmissionStatus @default(PENDING)
  flagged     Boolean          @default(false)
  rating      Int?             // Admin rating 1-10
  comment     String?          // Admin notes
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  event       Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, email])
  @@index([eventId])
}

enum SubmissionStatus {
  PENDING
  WAITLISTED
  AWAITING_CONFIRMATION
  CONFIRMED
  CANCELLED
  REJECTED
}
```

#### Demo

Approved demos that are part of the event.

```prisma
model Demo {
  id          String     @id @default(cuid())
  eventId     String
  index       Int        // Display order
  secret      String     @default(cuid())
  name        String
  description String?
  email       String
  url         String
  votable     Boolean    @default(true)

  event       Event      @relation(fields: [eventId], references: [id], onDelete: Cascade)
  feedback    Feedback[]
  votes       Vote[]
  awards      Award[]    @relation("AwardWinner")

  @@index([eventId])
}
```

#### Attendee

Event participants who provide feedback and vote.

```prisma
model Attendee {
  id            String          @id @default(cuid())
  name          String
  email         String
  linkedin      String?
  type          String?         // e.g., "Builder", "Investor", "Student"

  events        Event[]
  feedback      Feedback[]
  votes         Vote[]
  eventFeedback EventFeedback[]
}
```

#### Award

Votable awards that demos can win.

```prisma
model Award {
  id          String   @id @default(cuid())
  eventId     String
  index       Int      // Display order
  winnerId    String?  // Demo that won
  name        String
  description String
  votable     Boolean  @default(true)

  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  winner      Demo?    @relation("AwardWinner", fields: [winnerId], references: [id], onDelete: SetNull)
  votes       Vote[]

  @@index([eventId])
}
```

#### Feedback

Attendee feedback on individual demos.

```prisma
model Feedback {
  id           String   @id @default(cuid())
  eventId      String
  attendeeId   String
  demoId       String
  rating       Int?     // 1-10 stars
  claps        Int      @default(0) // 0-7 emoji reactions
  tellMeMore   Boolean  @default(false)
  quickActions String[] // Array of action IDs
  comment      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  event        Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  attendee     Attendee @relation(fields: [attendeeId], references: [id], onDelete: Cascade)
  demo         Demo     @relation(fields: [demoId], references: [id], onDelete: Cascade)

  @@unique([eventId, attendeeId, demoId])
  @@index([eventId, attendeeId])
}
```

#### Vote

Attendee votes for awards (supports both demo night and pitch night modes).

```prisma
model Vote {
  id         String   @id @default(cuid())
  eventId    String
  attendeeId String
  awardId    String
  demoId     String?  // Null to clear vote
  amount     Int?     // Dollar amount for pitch night (in thousands)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  event      Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  attendee   Attendee @relation(fields: [attendeeId], references: [id], onDelete: Cascade)
  award      Award    @relation(fields: [awardId], references: [id], onDelete: Cascade)
  demo       Demo?    @relation(fields: [demoId], references: [id], onDelete: Cascade)

  @@unique([eventId, attendeeId, awardId, demoId])
  @@index([awardId])
}
```

**Voting Modes**:
- **Demo Night**: One vote per award (demoId set, amount null)
- **Pitch Night**: Multiple votes with amounts (demoId set, amount in $1k increments)

#### EventFeedback

Overall event feedback from attendees.

```prisma
model EventFeedback {
  id           String   @id @default(cuid())
  eventId      String
  attendeeId   String
  comment      String?
  surveyOpened Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  event        Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  attendee     Attendee @relation(fields: [attendeeId], references: [id], onDelete: Cascade)

  @@unique([eventId, attendeeId])
}
```

#### NextAuth Models

Standard NextAuth.js database adapter models:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?

  accounts Account[]
  sessions Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Key Constraints & Indexes

**Unique Constraints**:
- `Submission`: One submission per email per event
- `Feedback`: One feedback per attendee per demo
- `Vote`: Prevents duplicate votes (eventId + attendeeId + awardId + demoId)
- `EventFeedback`: One feedback per attendee per event

**Indexes for Performance**:
- `Submission.eventId` - Fast submission lookups
- `Demo.eventId` - Event demo queries
- `Award.eventId` - Event award queries
- `Feedback.[eventId, attendeeId]` - Attendee feedback queries
- `Vote.awardId` - Vote counting

**Cascade Deletes**:
- Deleting Event cascades to all related entities
- Deleting Demo/Award cascades votes and feedback
- Deleting Attendee cascades their interactions

---

## API Specification

### tRPC Router Structure

**File**: `/src/server/api/root.ts`

```typescript
export const appRouter = createTRPCRouter({
  event: eventRouter,           // Event management
  submission: submissionRouter, // Demo submissions
  demo: demoRouter,             // Demo operations
  attendee: attendeeRouter,     // Attendee management
  award: awardRouter,           // Award operations
  feedback: feedbackRouter,     // Feedback collection
  vote: voteRouter,             // Voting system
  eventFeedback: eventFeedbackRouter, // Event feedback
});

export type AppRouter = typeof appRouter;
```

### Event Router

**File**: `/src/server/api/routers/event.ts`

#### `event.all` (public)

Get paginated list of past events.

**Input**:
```typescript
{
  limit?: number;  // Default: 10
  offset?: number; // Default: 0
}
```

**Output**: `CompleteEvent[]`
```typescript
{
  id: string;
  name: string;
  date: Date;
  url: string;
  config: EventConfig;
  demos: Demo[];
  awards: Award[];
  _count: { attendees: number };
}
```

#### `event.getCurrent` (public)

Get currently active event from Redis cache.

**Input**: None

**Output**: `CurrentEvent | null`
```typescript
{
  id: string;
  name: string;
  phase: EventPhase;
  currentDemoId: string | null;
  currentAwardId: string | null;
  isPitchNight: boolean;
}
```

#### `event.get` (public)

Get specific event by ID.

**Input**: `string` (eventId)

**Output**: `CompleteEvent`

#### `event.upsert` (protected)

Create or update event.

**Input**:
```typescript
{
  originalId?: string;  // For updates
  id?: string;
  name?: string;
  date?: Date;
  url?: string;
  config?: EventConfig;
}
```

**Behavior**:
- Creates default demos and awards for new events
- Uses `PITCH_NIGHT_AWARDS` if `config.isPitchNight === true`

#### `event.allAdmin` (protected)

Get all events with counts for admin dashboard.

**Output**: Events with `_count: { demos, attendees }`

#### `event.getAdmin` (protected)

Get event with all relations for admin view.

**Input**: `string` (eventId)

**Output**: `AdminEvent` (includes demos, attendees, awards, eventFeedback)

#### `event.updateCurrent` (protected)

Set or clear the currently active event in Redis.

**Input**: `string | null` (eventId)

**Behavior**: Updates Redis key `currentEvent`

#### `event.updateCurrentState` (protected)

Update active event's phase or current demo/award.

**Input**:
```typescript
{
  phase?: EventPhase;
  currentDemoId?: string | null;
  currentAwardId?: string | null;
}
```

**Behavior**: Updates Redis `currentEvent` object

#### `event.populateTestData` (protected, dev only)

Generate test data for development.

**Input**:
```typescript
{
  eventId: string;
  isPitchNight: boolean;
}
```

**Creates**:
- 10 test demos
- 10 test attendees (Mix of Builders, Investors, Students)
- Realistic feedback (ratings, claps, comments)
- Vote data (demo night selections or pitch night investments)

#### `event.delete` (protected)

Delete event and all related data.

**Input**: `string` (eventId)

### Submission Router

**File**: `/src/server/api/routers/submission.ts`

#### `submission.create` (public)

Submit a demo for review.

**Input**:
```typescript
{
  eventId: string;
  name: string;
  tagline: string;
  description: string;
  email: string;
  url: string;
  pocName: string;
  demoUrl?: string;
}
```

**Validation**:
- Unique constraint: one submission per email per event
- Returns error if duplicate

#### `submission.count` (public)

Get total submission count for event.

**Input**: `{ eventId: string }`

**Output**: `number`

#### `submission.all` (public)

Get all submissions (requires event secret).

**Input**: `{ eventId: string, secret: string }`

**Output**: `Submission[]`

#### `submission.adminUpdate` (protected)

Update submission details and status.

**Input**:
```typescript
{
  id: string;
  name?: string;
  tagline?: string;
  description?: string;
  email?: string;
  url?: string;
  pocName?: string;
  demoUrl?: string;
  status?: SubmissionStatus;
  flagged?: boolean;
  rating?: number;
  comment?: string;
}
```

#### `submission.convertToDemo` (protected)

Convert approved submission to demo.

**Input**: `string` (submissionId)

**Behavior**:
- Creates new Demo with auto-assigned index
- Generates demo secret
- Copies all fields from submission

#### `submission.update` (public)

Update submission (requires event secret).

**Input**:
```typescript
{
  eventId: string;
  secret: string;
  id: string;
  status?: SubmissionStatus;
  flagged?: boolean;
  rating?: number;
  comment?: string;
}
```

#### `submission.setSubmissions` (protected)

Bulk replace all submissions for event (CSV import).

**Input**:
```typescript
{
  eventId: string;
  submissions: Array<{
    name, tagline, description, email, url, pocName, demoUrl?
  }>;
}
```

**Behavior**: Deletes existing, creates new

#### `submission.delete` (protected)

Delete submission.

**Input**: `string` (submissionId)

### Demo Router

**File**: `/src/server/api/routers/demo.ts`

#### `demo.get` (public)

Get demo with feedback (requires demo secret).

**Input**: `{ id: string, secret: string }`

**Output**: `CompleteDemo` with filtered feedback
- Only shows attendee contact info if `tellMeMore === true` or `quickActions.length > 0`

#### `demo.update` (public)

Update demo details (requires demo secret).

**Input**:
```typescript
{
  id: string;
  secret: string;
  name: string;
  description?: string;
  email?: string;
  url?: string;
}
```

#### `demo.getFeedback` (protected)

Get all feedback for demo (admin view).

**Input**: `string` (demoId)

**Output**: `FeedbackAndAttendee[]` (includes full attendee details)

#### `demo.upsert` (protected)

Create or update demo.

**Input**:
```typescript
{
  originalId?: string;  // For updates
  id?: string;
  eventId: string;
  name: string;
  description?: string;
  email?: string;
  url?: string;
  votable?: boolean;
}
```

**Behavior**: Auto-assigns index for new demos

#### `demo.updateIndex` (protected)

Reorder demo in event.

**Input**: `{ id: string, index: number }`

**Behavior**: Transactionally shifts other demos' indices

#### `demo.setDemos` (protected)

Bulk replace all demos for event (CSV import).

**Input**:
```typescript
{
  eventId: string;
  demos: Array<{
    name, description?, email?, url?, votable?
  }>;
}
```

#### `demo.delete` (protected)

Delete demo and reindex remaining.

**Input**: `string` (demoId)

#### `demo.getStats` (public)

Get aggregated statistics (requires demo secret).

**Input**: `{ id: string, secret: string }`

**Output**:
```typescript
{
  totalFeedback: number;
  averageRating: number | null;
  totalClaps: number;
  totalTellMeMore: number;
  quickActionCounts: { [actionId: string]: number };
  totalMoneyRaised: number; // Pitch night only
}
```

### Attendee Router

**File**: `/src/server/api/routers/attendee.ts`

#### `attendee.upsert` (public)

Create or connect attendee to event.

**Input**: `{ id: string, eventId: string }`

**Behavior**:
- Creates attendee if doesn't exist
- Connects to event (many-to-many)

#### `attendee.update` (public)

Update attendee profile.

**Input**:
```typescript
{
  id: string;
  name?: string;
  email?: string;
  linkedin?: string;
  type?: string;
}
```

#### `attendee.delete` (protected)

Delete attendee.

**Input**: `string` (attendeeId)

#### `attendee.getAnalytics` (protected)

Get engagement metrics for all attendees at event.

**Input**: `string` (eventId)

**Output**: Attendees with `_count: { feedback, votes }` and eventFeedback

### Award Router

**File**: `/src/server/api/routers/award.ts`

#### `award.getVotes` (protected)

Get all votes for award.

**Input**: `string` (awardId)

**Output**: Votes with attendee name and type

#### `award.upsert` (protected)

Create or update award.

**Input**:
```typescript
{
  originalId?: string;
  id?: string;
  eventId: string;
  name: string;
  description: string;
  votable?: boolean;
}
```

#### `award.updateWinner` (protected)

Set award winner.

**Input**: `{ id: string, winnerId: string }`

#### `award.updateIndex` (protected)

Reorder award.

**Input**: `{ id: string, index: number }`

#### `award.setAwards` (protected)

Bulk replace awards (CSV import).

**Input**:
```typescript
{
  eventId: string;
  awards: Array<{
    name, description, votable?
  }>;
}
```

#### `award.delete` (protected)

Delete award and reindex.

**Input**: `string` (awardId)

### Feedback Router

**File**: `/src/server/api/routers/feedback.ts`

#### `feedback.all` (public)

Get all feedback for attendee at event.

**Input**: `{ eventId: string, attendeeId: string }`

**Output**: `{ [demoId: string]: Feedback }`

#### `feedback.upsert` (public)

Create or update feedback.

**Input**:
```typescript
{
  eventId: string;
  attendeeId: string;
  demoId: string;
  rating?: number;      // 1-10
  claps?: number;       // 0-7
  tellMeMore?: boolean;
  quickActions?: string[];
  comment?: string;
}
```

**Validation**: Rating must be 1-10 (MAX_RATING constant is 5 but schema allows 10)

#### `feedback.delete` (protected)

Delete feedback.

**Input**: `string` (feedbackId)

### Vote Router

**File**: `/src/server/api/routers/vote.ts`

#### `vote.all` (public)

Get all votes for attendee at event.

**Input**: `{ eventId: string, attendeeId: string }`

**Output**: `Vote[]`

#### `vote.upsert` (public)

Create or update vote.

**Input**:
```typescript
{
  eventId: string;
  attendeeId: string;
  awardId: string;
  demoId?: string | null;
  amount?: number;
}
```

**Validation**:
- Amount must be in $1k increments
- Amount ≥ 0
- Total allocations across all awards ≤ $100k (pitch night)

**Behavior**:
- If `demoId === null`, deletes existing votes (clear selection)
- Otherwise upserts vote

#### `vote.getTotalInvestments` (public)

Get investment totals by demo for pitch night.

**Input**: `{ eventId: string, awardId: string }`

**Output**: `{ [demoId: string]: number }`

#### `vote.delete` (public)

Delete vote.

**Input**: `string` (voteId)

### Event Feedback Router

**File**: `/src/server/api/routers/eventFeedback.ts`

#### `eventFeedback.get` (public)

Get event feedback for attendee.

**Input**: `{ eventId: string, attendeeId: string }`

**Output**: `EventFeedback | null`

#### `eventFeedback.getAdmin` (protected)

Get all event feedback for admin.

**Input**: `string` (eventId)

**Output**: `EventFeedbackAndAttendee[]`

#### `eventFeedback.upsert` (public)

Create or update event feedback.

**Input**:
```typescript
{
  eventId: string;
  attendeeId: string;
  comment?: string;
}
```

#### `eventFeedback.delete` (protected)

Delete event feedback.

**Input**: `string` (eventFeedbackId)

#### `eventFeedback.markSurveyOpened` (public)

Track when attendee opens survey link.

**Input**: `{ eventId: string, attendeeId: string }`

**Behavior**: Sets `surveyOpened = true`

---

## Authentication & Authorization

### NextAuth Configuration

**File**: `/src/server/auth.ts`

#### Providers

**1. Google OAuth (Production)**
```typescript
GoogleProvider({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
})
```

**2. Credentials (Development Only)**
```typescript
CredentialsProvider({
  credentials: { username: { type: "text" } },
  authorize: async (credentials) => {
    if (env.NODE_ENV !== "development") return null;
    return { id: "test-user", email: "test@example.com" };
  },
})
```

#### Database Adapter

```typescript
adapter: PrismaAdapter(db)
```

Stores sessions in PostgreSQL using NextAuth tables (User, Account, Session, VerificationToken).

#### Session Strategy

```typescript
session: { strategy: "database" }
```

Sessions stored in database, not JWT tokens.

#### Callbacks

```typescript
session({ session, user }) {
  if (session.user) {
    session.user.id = user.id;
  }
  return session;
}
```

### Middleware Protection

**File**: `/src/middleware.ts`

```typescript
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except submissions (has secret auth)
  if (pathname.startsWith("/admin") &&
      !pathname.includes("/submissions")) {
    if (!req.auth) {
      return Response.redirect(new URL("/api/auth/signin", req.url));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

### Authorization Patterns

**Protected tRPC Procedures**:
```typescript
protectedProcedure  // Checks req.session, throws UNAUTHORIZED if null
```

**Secret-Based Access**:
- **Event Secret**: Access to submissions without login
- **Demo Secret**: Demo presenters view their feedback without login

**Admin Routes**: Require NextAuth session (Google OAuth in production)

**Public Routes**: Event pages, submission forms, demo presenter dashboards (with secret)

---

## State Management & Caching

### Client State (React Query via tRPC)

**File**: `/src/trpc/react.tsx`

```typescript
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
}));

const trpcClient = api.createClient({
  links: [
    unstable_httpBatchStreamLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: SuperJSON,
    }),
  ],
});
```

**Features**:
- Automatic request batching
- 1-minute stale time for queries
- Optimistic updates for mutations
- Type-safe hooks: `api.event.get.useQuery()`

### Server State (Redis/Vercel KV)

**File**: `/src/lib/types/currentEvent.ts`

**Key**: `currentEvent`

**Value**: `CurrentEvent`
```typescript
{
  id: string;
  name: string;
  phase: EventPhase;
  currentDemoId: string | null;
  currentAwardId: string | null;
  isPitchNight: boolean;
}
```

**Purpose**:
- Real-time event state synchronization
- Admin controls update Redis
- Attendee pages poll Redis for updates
- Enables live presentation mode

**Connection**:
- Local: Redis Docker container (`localhost:6379`)
- Production: Vercel KV (Redis-compatible)

**Cache Operations**:
```typescript
// Get current event
const currentEvent = await redis.get<CurrentEvent>("currentEvent");

// Set current event
await redis.set("currentEvent", eventData);

// Update current event
await redis.set("currentEvent", { ...currentEvent, phase: "Demos" });

// Clear current event
await redis.set("currentEvent", null);
```

### URL State (nuqs)

Used for maintaining filter and pagination state in URLs:

```typescript
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
const [status, setStatus] = useQueryState('status');
```

**Benefits**:
- Shareable URLs with filters
- Browser back/forward support
- No prop drilling

---

## User Workflows

### 1. Demo Submission Workflow

**User Journey**:

```
┌─────────────────┐
│ Submit Form     │ → Attendee fills form at /[eventId]/submit
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create          │ → submission.create (PENDING status)
│ Submission      │   Validates unique email per event
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Admin Review    │ → Admin views at /admin/[eventId]/submissions
└────────┬────────┘   Rates, flags, comments
         │
         ├───► WAITLISTED
         ├───► AWAITING_CONFIRMATION
         ├───► CONFIRMED ───┐
         ├───► REJECTED     │
         └───► CANCELLED    │
                            ▼
                    ┌──────────────────┐
                    │ Convert to Demo  │ → submission.convertToDemo
                    └──────────────────┘   Creates Demo entity
```

**Key Files**:
- Form: `/src/app/(submission)/[eventId]/submit/page.tsx`
- Review: `/src/app/admin/[eventId]/submissions/page.tsx`
- API: `/src/server/api/routers/submission.ts`

### 2. Attendee Event Experience

**User Journey**:

```
1. LOAD EVENT
   └─ Navigate to /[eventId]
   └─ Create/connect attendee (attendee.upsert)
   └─ Fetch event data and current state from Redis

2. PRE-EVENT PHASE (phase: "Pre")
   └─ PreWorkspace displays event info and partners

3. DEMOS PHASE (phase: "Demos")
   └─ DemosWorkspace shows all demos
   └─ Current demo highlighted (from Redis currentDemoId)
   └─ For each demo:
      ├─ Rate 1-10 stars (optional)
      ├─ Give 0-7 claps
      ├─ Check "Tell Me More"
      ├─ Select quick actions
      └─ Add comment
   └─ feedback.upsert auto-saves after each change

4. VOTING PHASE (phase: "Voting")
   └─ VotingWorkspace shows all awards

   Demo Night Mode:
   └─ Select one demo per award
   └─ vote.upsert for each selection

   Pitch Night Mode:
   └─ Allocate $100k budget across demos
   └─ Minimum $1k increments
   └─ Validate total ≤ $100k
   └─ vote.upsert creates multiple vote records

5. RESULTS PHASE (phase: "Results")
   └─ ResultsWorkspace displays winners
   └─ Confetti animations
   └─ Vote counts / investment totals

6. RECAP PHASE (phase: "Recap")
   └─ RecapWorkspace event summary
   └─ eventFeedback.upsert for overall feedback
   └─ Optional survey link (opens in new tab)
   └─ eventFeedback.markSurveyOpened tracking
```

**Key Files**:
- Main page: `/src/app/(attendee)/[eventId]/page.tsx`
- Workspaces: `/src/app/(attendee)/components/`
- Feedback API: `/src/server/api/routers/feedback.ts`
- Vote API: `/src/server/api/routers/vote.ts`

### 3. Admin Event Control

**User Journey**:

```
1. CREATE EVENT
   └─ Navigate to /admin
   └─ Click "Create Event"
   └─ event.upsert creates event with default demos/awards

2. CONFIGURE EVENT
   └─ Navigate to /admin/[eventId]
   └─ Configuration tab:
      ├─ Edit event name, date, URL
      ├─ Set isPitchNight flag
      ├─ Add custom quick actions
      ├─ Add partner logos/links
      └─ Set survey URL

3. MANAGE DEMOS
   └─ Demos tab:
      ├─ Import from CSV (demo.setDemos)
      ├─ Add/edit demos manually
      ├─ Reorder (demo.updateIndex)
      ├─ Set votable flag
      └─ Delete demos

4. MANAGE AWARDS
   └─ Similar to demos (award.* procedures)

5. REVIEW SUBMISSIONS
   └─ Submissions tab:
      ├─ Filter by status
      ├─ Rate and comment
      ├─ Update status
      └─ Convert to demo

6. START EVENT
   └─ Control Center tab:
      ├─ event.updateCurrent sets active event in Redis
      ├─ Opens attendee view at /[eventId]
      └─ Opens presentation mode at /admin/present

7. CONTROL LIVE EVENT
   └─ Presentation mode:
      ├─ QR code for attendees
      ├─ Phase controls:
      │  └─ Pre → Demos → Voting → Results → Recap
      ├─ Demo navigation (updates currentDemoId in Redis)
      ├─ Award navigation (updates currentAwardId in Redis)
      └─ Real-time attendee count

8. VIEW RESULTS
   └─ Results Dashboard tab:
      ├─ Vote counts per award
      ├─ Investment totals (pitch night)
      ├─ Select winners (award.updateWinner)
      └─ Export to CSV

9. ANALYZE ENGAGEMENT
   └─ Attendees tab:
      ├─ attendee.getAnalytics
      ├─ View feedback/vote counts
      └─ Export attendee data

10. REVIEW FEEDBACK
    └─ Event Feedback tab:
       ├─ eventFeedback.getAdmin
       ├─ Read comments
       └─ Track survey engagement
```

**Key Files**:
- Dashboard: `/src/app/admin/[eventId]/page.tsx`
- Control Center: `/src/app/admin/[eventId]/components/ControlCenter/`
- Present Mode: `/src/app/admin/present/page.tsx`
- Event API: `/src/server/api/routers/event.ts`

### 4. Demo Presenter Dashboard

**User Journey**:

```
1. RECEIVE LINK
   └─ Admin sends link with demo secret
   └─ Format: /[eventId]/[demoId]?secret=xxx

2. VIEW FEEDBACK
   └─ demo.get fetches demo with filtered feedback
   └─ Only see contact info if:
      ├─ tellMeMore === true, OR
      └─ quickActions.length > 0

3. VIEW STATS
   └─ demo.getStats aggregates:
      ├─ Total feedback count
      ├─ Average rating
      ├─ Total claps
      ├─ Tell me more count
      ├─ Quick action breakdown
      └─ Total investment (pitch night)

4. UPDATE DEMO INFO
   └─ demo.update allows editing:
      ├─ Name
      ├─ Description
      ├─ Email
      └─ URL
```

**Key Files**:
- Dashboard: `/src/app/(demoist)/[eventId]/[demoId]/page.tsx`
- API: `/src/server/api/routers/demo.ts`

---

## Event Lifecycle

### Phase Enumeration

```typescript
enum EventPhase {
  Pre = "Pre",           // Pre-event welcome
  Demos = "Demos",       // Live demo presentations
  Voting = "Voting",     // Attendee voting period
  Results = "Results",   // Display winners
  Recap = "Recap",       // Post-event feedback
}
```

### Phase Transitions

Controlled by admin via `event.updateCurrentState`:

```
Pre
 │
 ├─ Display event info and partners
 ├─ No interactions enabled
 │
 └──► Demos
      │
      ├─ Admin navigates through demos
      ├─ Updates currentDemoId in Redis
      ├─ Attendees see current demo highlighted
      ├─ Feedback forms available
      │
      └──► Voting
           │
           ├─ Feedback forms locked
           ├─ Voting interface enabled
           ├─ Demo Night: Select one per award
           ├─ Pitch Night: Allocate $100k budget
           │
           └──► Results
                │
                ├─ Admin selects winners
                ├─ Display vote counts
                ├─ Confetti animations
                │
                └──► Recap
                     │
                     ├─ Event summary
                     ├─ Overall feedback form
                     └─ Survey link
```

### Real-time Synchronization

**Mechanism**:
1. Admin updates phase via tRPC mutation
2. Mutation updates Redis `currentEvent` object
3. Attendee pages poll `event.getCurrent` every 2 seconds
4. UI reactively updates based on phase change

**Polling Implementation**:
```typescript
const { data: currentEvent } = api.event.getCurrent.useQuery(undefined, {
  refetchInterval: 2000,
});
```

---

## Configuration & Environment

### Environment Variables

**File**: `/src/env.js`

Uses `@t3-oss/env-nextjs` for type-safe environment variable validation.

#### Server Variables

```typescript
server: {
  DATABASE_URL: z.string().url(),
  DATABASE_URL_NON_POOLING: z.string().url(),
  KV_URL: z.string(),
  KV_REST_API_URL: z.string().url(),
  KV_REST_API_TOKEN: z.string(),
  KV_REST_API_READ_ONLY_TOKEN: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
}
```

#### Client Variables

```typescript
client: {
  NEXT_PUBLIC_URL: z.string().url(),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
}
```

#### Validation

Runs at build time and throws if any required variables are missing or invalid.

### Database Connection

**Development**:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/demonight"
DATABASE_URL_NON_POOLING="postgresql://user:password@localhost:5432/demonight"
```

**Production** (Vercel Postgres):
```bash
DATABASE_URL="postgres://user:pass@region.postgres.vercel-storage.com/db?pgbouncer=true"
DATABASE_URL_NON_POOLING="postgres://user:pass@region.postgres.vercel-storage.com/db"
```

**Pooling**:
- `DATABASE_URL`: Pooled connection via PgBouncer (for queries)
- `DATABASE_URL_NON_POOLING`: Direct connection (for migrations)

### Redis Connection

**Development** (Docker):
```bash
./start-database.sh  # Starts Redis on localhost:6379

KV_URL="redis://localhost:6379"
KV_REST_API_URL="http://localhost:8079"
KV_REST_API_TOKEN="local-token"
KV_REST_API_READ_ONLY_TOKEN="local-token"
```

**Production** (Vercel KV):
```bash
# Auto-populated by Vercel
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

### NextAuth Configuration

**Development**:
```bash
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional in dev, can use Credentials provider)
GOOGLE_CLIENT_ID="optional"
GOOGLE_CLIENT_SECRET="optional"
```

**Production**:
```bash
NEXTAUTH_SECRET="secure-random-secret"
NEXTAUTH_URL="https://demos.aicollective.com"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Branding Configuration

**File**: `/src/lib/branding.server.ts`

```typescript
function getBranding(hostname: string, eventConfig?: EventConfig) {
  // Priority 1: Event config
  if (eventConfig?.isPitchNight) return PITCH_NIGHT;

  // Priority 2: Hostname
  if (hostname.includes("pitches")) return PITCH_NIGHT;

  // Default
  return DEMO_NIGHT;
}
```

**Branding Objects**:
```typescript
DEMO_NIGHT = {
  name: "Demo Night",
  tagline: "Showcase your work",
  colors: { primary: "...", secondary: "..." },
  logo: "/demo-night-logo.svg",
}

PITCH_NIGHT = {
  name: "Pitch Night",
  tagline: "Invest in the future",
  colors: { primary: "...", secondary: "..." },
  logo: "/pitch-night-logo.svg",
}
```

---

## Development Guide

### Setup

```bash
# Clone repository
git clone [repo-url]
cd demo-night-app

# Install dependencies
yarn install
yarn global add dotenv-cli

# Start database services
./start-database.sh
# Starts PostgreSQL (port 5432) and Redis (port 6379) via Docker

# Setup database
yarn db:push          # Push schema to database
yarn db:seed          # Seed with test data

# Start development server
yarn dev              # http://localhost:3000
```

### Database Commands

```bash
# Create migration
yarn db:migrate:create  # Generate migration file
yarn db:migrate         # Create and apply migration

# Schema sync (no migration)
yarn db:push            # Push schema changes directly

# Seed data
yarn db:seed            # Creates test@example.com user + sample data

# GUI
yarn db:studio          # Open Prisma Studio at http://localhost:5555
```

### Development Workflow

**1. Feature Development**:
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes to schema
# Edit prisma/schema.prisma

# Push schema (dev only, no migration)
yarn db:push

# Run dev server
yarn dev

# Test changes
# ...

# Create migration (when stable)
yarn db:migrate:create
yarn db:migrate

# Commit
git add .
git commit -m "feat: your feature"
```

**2. Adding a New tRPC Procedure**:

```typescript
// 1. Create/edit router file
// src/server/api/routers/yourRouter.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const yourRouter = createTRPCRouter({
  yourProcedure: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.yourModel.findUnique({
        where: { id: input.id },
      });
    }),
});

// 2. Add to root router
// src/server/api/root.ts

import { yourRouter } from "./routers/yourRouter";

export const appRouter = createTRPCRouter({
  // ...existing routers
  your: yourRouter,
});

// 3. Use in component
// src/app/your-page/page.tsx

"use client";
import { api } from "~/trpc/react";

export default function YourPage() {
  const { data } = api.your.yourProcedure.useQuery({ id: "123" });
  return <div>{data?.name}</div>;
}
```

**3. Creating a New Page**:

```bash
# Create route directory
mkdir -p src/app/your-route

# Create page file
touch src/app/your-route/page.tsx
```

```typescript
// src/app/your-route/page.tsx

export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
    </div>
  );
}
```

### Testing Credentials

**Development Login**:
- Email: `test@example.com`
- Password: Not required (Credentials provider in dev)

**Test Data**:
```bash
yarn db:seed  # Creates:
              # - test@example.com user
              # - Sample event
              # - 10 demos
              # - 10 attendees
              # - Feedback and votes
```

### Common Commands

```bash
# Development
yarn dev                  # Start dev server
yarn build                # Production build
yarn start                # Start production server
yarn lint                 # Run ESLint

# Database
yarn db:push              # Push schema (no migration)
yarn db:migrate           # Create and apply migration
yarn db:migrate:create    # Create migration only
yarn db:studio            # Open Prisma Studio
yarn db:seed              # Seed test data

# Docker
./start-database.sh       # Start PostgreSQL + Redis
docker compose down       # Stop services
docker volume rm demonight_postgres_data  # Reset database
```

### File Locations Reference

**Key Configuration**:
- Database schema: `/prisma/schema.prisma`
- Environment config: `/src/env.js`
- tRPC root: `/src/server/api/root.ts`
- NextAuth: `/src/server/auth.ts`
- Middleware: `/src/middleware.ts`

**Routers**:
- Event: `/src/server/api/routers/event.ts`
- Submission: `/src/server/api/routers/submission.ts`
- Demo: `/src/server/api/routers/demo.ts`
- Attendee: `/src/server/api/routers/attendee.ts`
- Award: `/src/server/api/routers/award.ts`
- Feedback: `/src/server/api/routers/feedback.ts`
- Vote: `/src/server/api/routers/vote.ts`
- Event Feedback: `/src/server/api/routers/eventFeedback.ts`

**Pages**:
- Admin dashboard: `/src/app/admin/[eventId]/page.tsx`
- Attendee event: `/src/app/(attendee)/[eventId]/page.tsx`
- Demo submission: `/src/app/(submission)/[eventId]/submit/page.tsx`
- Demo dashboard: `/src/app/(demoist)/[eventId]/[demoId]/page.tsx`
- Presentation mode: `/src/app/admin/present/page.tsx`

**Types**:
- Event config: `/src/lib/types/eventConfig.ts`
- Current event: `/src/lib/types/currentEvent.ts`
- Awards: `/src/lib/types/award.ts`
- Demos: `/src/lib/types/demo.ts`

---

## Appendix

### TypeScript Path Aliases

```json
{
  "paths": {
    "~/*": ["./src/*"],
    "~~/*": ["./*"]
  }
}
```

Usage:
```typescript
import { db } from "~/server/db";
import type { EventConfig } from "~/lib/types/eventConfig";
```

### Package Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:migrate:create": "prisma migrate dev --create-only",
  "db:studio": "prisma studio",
  "db:seed": "tsx prisma/seed.ts"
}
```

### Event Config Schema

```typescript
type EventConfig = {
  quickActions: QuickAction[];
  partners: Partner[];
  isPitchNight: boolean;
  surveyUrl?: string;
};

type QuickAction = {
  id: string;
  label: string;
  icon: string;
};

type Partner = {
  name: string;
  logo: string;
  url: string;
};
```

### Demo/Award Templates

**Demo Night Awards** (`/src/lib/types/award.ts`):
- Best Overall Demo
- Most Innovative
- Best Pitch
- Audience Favorite

**Pitch Night Awards** (`/src/lib/types/award.ts`):
- Best Investment Opportunity

**Default Demo Templates** (`/src/lib/types/demo.ts`):
- Sample demo structures for rapid event setup

---

**End of Specification**
