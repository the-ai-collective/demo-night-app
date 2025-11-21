# Chapter Management System

## Overview

The Chapter Management System allows Demo Night App administrators to organize events by chapter (e.g., geographic locations like "San Francisco", "New York", etc.). Each chapter has a name and emoji icon that displays throughout the application.

## Features

- Create, edit, and delete chapters
- Assign chapters to events (optional)
- Filter events by chapter on admin dashboard
- Display chapter emoji/name throughout the app
- Graceful handling of chapter deletion (events retain their data but lose chapter association)

## Database Schema

### Chapter Model

```prisma
model Chapter {
  id    String @id @default(cuid())
  name  String
  emoji String

  events Event[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Event Model Updates

```prisma
model Event {
  id String @id @default(cuid())

  name      String
  date      DateTime
  url       String
  config    Json     @default("{}")
  secret    String   @default(cuid())
  chapter   Chapter? @relation(fields: [chapterId], references: [id], onDelete: SetNull)
  chapterId String?

  // ... other fields

  @@index([chapterId])
}
```

**Key Design Decisions:**
- `chapterId` is nullable - events can exist without a chapter
- `onDelete: SetNull` - when a chapter is deleted, events remain but lose their chapter association
- Index on `chapterId` for efficient filtering queries

## API Endpoints (tRPC)

### Chapter Router (`src/server/api/routers/chapter.ts`)

#### Public Procedures

- **`all`**: Get all chapters (ordered by name)
  ```typescript
  const chapters = await api.chapter.all.useQuery();
  ```

- **`get`**: Get a single chapter by ID
  ```typescript
  const chapter = await api.chapter.get.useQuery(chapterId);
  ```

#### Protected Procedures (Admin Only)

- **`allWithCounts`**: Get all chapters with event counts
  ```typescript
  const chapters = await api.chapter.allWithCounts.useQuery();
  // Returns: { id, name, emoji, _count: { events } }[]
  ```

- **`create`**: Create a new chapter
  ```typescript
  const chapter = await api.chapter.create.mutate({
    name: "San Francisco",
    emoji: "🌉"
  });
  ```

- **`update`**: Update a chapter
  ```typescript
  const chapter = await api.chapter.update.mutate({
    id: chapterId,
    name: "SF Bay Area",
    emoji: "🌁"
  });
  ```

- **`delete`**: Delete a chapter
  ```typescript
  await api.chapter.delete.mutate(chapterId);
  // Note: Associated events will have chapterId set to null
  ```

### Event Router Updates (`src/server/api/routers/event.ts`)

- **`allAdmin`**: Now includes chapter data
  ```typescript
  {
    chapter: {
      select: {
        id: true,
        name: true,
        emoji: true,
      },
    },
  }
  ```

- **`upsert`**: Now accepts `chapterId` parameter
  ```typescript
  await api.event.upsert.mutate({
    // ... other fields
    chapterId: selectedChapterId || null
  });
  ```

## User Interface

### Admin Dashboard (`/admin`)

#### Chapters Section

- **Location**: Top of admin home page, above Events section
- **Display**: Collapsible section (click "Chapters" header to expand/collapse)
- **Grid Layout**: Responsive grid (2-4 columns depending on screen size)
- **Features**:
  - View all chapters with event counts
  - Click any chapter card to edit it
  - "Create Chapter" button to add new chapters

#### Events Section

- **Chapter Filter**: Dropdown to filter events by chapter (only shown when chapters exist)
- **Event Cards**: Display chapter emoji next to event name when assigned
- **Create/Edit Event**: Chapter selector dropdown in event modal

### Components

#### `UpsertChapterModal.tsx`
- Create or edit chapters
- Fields: Name (required), Emoji (required, max 10 chars)
- Includes delete button when editing
- Toast notifications for success/error states

#### `DeleteChapter.tsx`
- Confirmation dialog before deletion
- Warning message explains that events will lose chapter association
- Cannot be undone

#### `UpsertEventModal.tsx` Updates
- Added chapter selector dropdown
- Shows chapters with emoji in dropdown
- Optional field (events can have no chapter)

### Hall of Fame (`/hall-of-fame`)

- **Event Display**: Chapter emoji shown next to event name
- **Event Selector**: Chapter emoji shown in event list
- **Event Selector Modal**: Chapter emoji shown in event selection grid

## Usage Guide

### Creating a Chapter

1. Navigate to `/admin`
2. Expand "Chapters" section (click the header)
3. Click "Create Chapter" button
4. Enter chapter name (e.g., "San Francisco")
5. Enter emoji (e.g., "🌉")
6. Click "Create Chapter"

### Assigning a Chapter to an Event

1. Navigate to `/admin`
2. Click "Create Event" or edit an existing event
3. Select a chapter from the "Chapter (Optional)" dropdown
4. Complete other event fields
5. Click "Create Event" or "Update Event"

### Filtering Events by Chapter

1. Navigate to `/admin`
2. Use the chapter filter dropdown next to "Events" heading
3. Select a chapter to show only events from that chapter
4. Select "All Chapters" to show all events

### Editing a Chapter

1. Navigate to `/admin`
2. Expand "Chapters" section
3. Click on the chapter card you want to edit
4. Modify name or emoji
5. Click "Update Chapter"

### Deleting a Chapter

1. Navigate to `/admin`
2. Expand "Chapters" section
3. Click on the chapter card you want to delete
4. Click "Delete" button
5. Confirm deletion in the dialog
6. Events associated with this chapter will remain but will no longer be linked to it

## File Structure

```
src/
├── server/
│   └── api/
│       ├── routers/
│       │   └── chapter.ts              # New chapter router
│       └── root.ts                      # Updated to include chapter router
├── app/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── UpsertChapterModal.tsx  # New chapter modal
│   │   │   ├── DeleteChapter.tsx       # New delete component
│   │   │   └── UpsertEventModal.tsx    # Updated with chapter selector
│   │   └── page.tsx                    # Updated with chapters section
│   └── hall-of-fame/
│       └── components/
│           ├── EventDisplay.tsx        # Updated to show chapter emoji
│           └── EventSelector.tsx       # Updated to show chapter emoji
└── prisma/
    └── schema.prisma                   # Updated with Chapter model

docs/
└── CHAPTER_MANAGEMENT_SYSTEM.md        # This file
```

## Technical Implementation Details

### State Management

The admin home page manages chapter-related state:

```typescript
const [chapterModalOpen, setChapterModalOpen] = useState(false);
const [chapterToEdit, setChapterToEdit] = useState<Chapter | undefined>(undefined);
const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
const [showChapters, setShowChapters] = useState(false);
```

### Filtering Logic

Events are filtered client-side for immediate response:

```typescript
const filteredEvents = events?.filter(
  (event) => !selectedChapterId || event.chapterId === selectedChapterId
);
```

### Type Safety

All chapter operations are fully type-safe using:
- Zod schemas for input validation
- Prisma-generated types for database operations
- TypeScript inference for tRPC procedures

### Performance Considerations

- Database index on `Event.chapterId` for efficient filtering
- Chapter list uses `allWithCounts` query that efficiently counts related events
- Client-side filtering avoids unnecessary API calls
- React Query caching for chapter data

## Migration Notes

### Applying the Schema Changes

```bash
# Development (recommended)
yarn db:push

# Production (create migration)
yarn db:migrate
```

### Backwards Compatibility

- Existing events without chapters continue to work normally
- `chapterId` is nullable, so no data migration required
- Chapter filter shows "All Chapters" by default

### Edge Cases Handled

1. **Chapter Deletion**: Events with deleted chapter have `chapterId` set to null automatically (database constraint)
2. **No Chapters**: UI gracefully handles empty state with helpful message
3. **Chapter Filter**: Only shown when chapters exist
4. **Event Display**: Chapter emoji only shown when event has a chapter assigned

## Future Enhancements

Potential features to consider:

- Chapter-specific branding/theming
- Chapter administrators (role-based permissions)
- Multi-chapter event support
- Chapter statistics dashboard
- Bulk chapter assignment for events
- Chapter archive/inactive status
- Chapter-specific email templates
- Geographic mapping integration

## Troubleshooting

### Chapter not showing on event

- Verify event has `chapterId` set in database
- Check that chapter still exists (not deleted)
- Ensure event query includes chapter relation

### Cannot delete chapter

- Check for database connection
- Verify admin authentication
- Check browser console for error messages

### Events disappeared after filtering

- Click "All Chapters" in filter dropdown to reset
- Verify selected chapter actually has events
- Check that events have correct `chapterId` in database

## Testing Checklist

- [ ] Create a new chapter
- [ ] Edit chapter name and emoji
- [ ] Assign chapter to new event
- [ ] Assign chapter to existing event
- [ ] Filter events by chapter
- [ ] View chapter emoji on admin dashboard
- [ ] View chapter emoji on hall of fame
- [ ] Delete chapter (verify events remain)
- [ ] Create event without chapter
- [ ] Toggle chapters section expand/collapse

## Support

For issues or questions about the Chapter Management System:
1. Check this documentation
2. Review the implementation files listed above
3. Check TypeScript/ESLint errors
4. Verify database schema is up to date
