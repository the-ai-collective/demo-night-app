# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Demo Night App (DNA) is a Next.js application built for managing demo night events. It allows for demo submissions, attendee feedback, voting on awards, and real-time event administration.

## Development Commands

### Setup & Dependencies

```bash
yarn install                  # Install dependencies
yarn global add dotenv-cli   # Install global dotenv-cli (required for local dev)
./start-database.sh          # Start PostgreSQL and Redis via Docker
yarn db:push                 # Push schema to database
yarn db:seed                 # Seed with test data (test@example.com account)
```

### Development

```bash
yarn dev                     # Start development server (http://localhost:3000)
yarn lint                    # Run ESLint
yarn build                   # Production build
```

### Database Operations

```bash
yarn db:migrate              # Create and apply migrations
yarn db:migrate:create       # Create migration without applying
yarn db:studio               # Open Prisma Studio GUI
yarn db:push                 # Push schema without migration
```

### Email Development

```bash
yarn email:preview           # Start email preview server (http://localhost:3001)
```

The email preview server allows you to view and test all email templates in a browser:
- Preview all email templates from `/src/emails/` directory
- See how emails look across different email clients
- Test email content without sending actual emails
- Hot reload when email templates are modified

Email templates are built with React Email and include:
- **SubmissionConfirmation** - Sent when a demo is submitted
- **SubmissionApproved** - Sent when a submission is approved
- **SubmissionRejected** - Sent when a submission is rejected

## Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe APIs
- **Cache**: Redis/Vercel KV
- **Auth**: NextAuth.js with Google OAuth
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (via tRPC)

### Directory Structure

- `/src/app/` - Next.js App Router pages and layouts
  - `(attendee)/` - Attendee-facing event pages
  - `(demoist)/` - Demo presenter pages
  - `(submission)/` - Demo submission flow
  - `admin/` - Event administration dashboard
  - `hall-of-fame/` - Past event winners display
  - `api/` - API routes for tRPC and NextAuth
- `/src/server/` - Backend logic
  - `api/routers/` - tRPC router definitions (event, demo, attendee, etc.)
  - `auth.ts` - NextAuth configuration
  - `db.ts` - Prisma client instance
- `/src/components/` - Reusable React components
  - `ui/` - shadcn/ui base components
- `/prisma/` - Database schema and migrations

### Key Models (Prisma Schema)

- **Event** - Core event with demos, attendees, awards, and configuration
- **Demo** - Individual demo with feedback and voting capabilities
- **Submission** - Demo submission requests with approval workflow
- **Attendee** - Event participants who can provide feedback and vote
- **Award** - Votable awards that can be won by demos
- **Feedback** - Attendee feedback on demos (ratings, claps, comments)
- **Vote** - Attendee votes for awards

### API Pattern

All APIs are defined as tRPC routers in `/src/server/api/routers/`. The app uses:

- `publicProcedure` for unauthenticated endpoints
- `protectedProcedure` for authenticated endpoints requiring login

### Environment Variables

Required environment variables are defined in `.env.example` and validated in `/src/env.js`. Key variables:

- Database URLs (PostgreSQL)
- Redis/KV store configuration
- NextAuth secret and OAuth credentials
- Public URLs for the application

### Event Workflow

1. **Pre-Event**: Admins create event, demos submit via submission form
2. **During Event**: Attendees provide feedback on demos, vote for awards
3. **Post-Event**: View results, hall of fame for past winners

### Development Notes

- Use absolute imports with `~/` prefix (configured in tsconfig.json)
- Follow existing component patterns in `/src/components/ui/`
- tRPC procedures should include proper Zod validation
- Database changes require migrations via `yarn db:migrate`
- Test with `test@example.com` account in local development
