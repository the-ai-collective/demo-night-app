## Summary
This PR adds two major features to the Demo Night App:

**1. 1v1 Match Mode (Head-to-Head Battles)**
- Demos compete in bracket-style 1v1 matches
- Real-time voting with live vote counts
- Admin controls to create, start, and close matches
- Automatic winner computation

**2. Judge/Jury Weighted Voting**
- Judges can be marked with `isJudge: true` flag
- Vote weight: 50% audience + 50% judges
- Separate tracking of audience vs judge votes
- Judge badge displayed in UI

## Changes Made

### Database Schema
- Added `Match` model for head-to-head competitions
- Added `User.isJudge` field for judge role
- Added `Event.oneVsOneMode` toggle for match mode
- Added `Vote.matchId` and `Vote.voteType` for match voting

### Backend (tRPC)
- Created `match` router with endpoints: all, get, create, start, closeVoting, getResults, delete
- Updated `vote` router to support matchId and voteType
- Implemented weighted scoring algorithm in `computeMatchWinner()`
- Added `demo.all` endpoint

### Frontend
- Created admin match management UI at `/admin/test-match`
- Created voting interface at `/vote-match`
- Live vote counts with 2-3 second refresh intervals
- Judge badge and role indicators
- Real-time match status updates

### Testing
- Added test scripts: `create-test-user.js`, `create-test-data.js`, `create-test-attendees.js`
- Test pages for development and QA

## How to Test
1. Run `node create-test-user.js` to create test users
2. Run `node create-test-data.js` to create test event and demos
3. Run `node create-test-attendees.js` to create attendees
4. Visit `/admin/test-match` to create and manage matches
5. Visit `/vote-match` to test voting as audience/judge

## Compatibility
- All existing features remain unchanged
- Traditional voting mode still works when `oneVsOneMode: false`
- No breaking changes to existing functionality

🤖 Generated with [Claude Code](https://claude.com/claude-code)
