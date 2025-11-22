# Proposal

While integrating chapter features into the Event functionality, I identified a
feature that could enhance both user and organizer experience - the chapter functionality.

## Background
At this time, does not contain the geographic location of the chapter - it needs
to be inferred from the name (i.e. "SF" or "NYC").

This makes it difficult for users to find events outside of their chapter, but that
may be near them regardless of their affiliation.

## Proposal
Rather than inferring chapter location from the name, we should add geographic
location data to the chapter model. This would allow us to easily add the following features:

- Nearby event discovery by location
- City-specific chapters, rather than metroplex-based for large areas
- Enhanced data for organizers
- "Event Passport" - view prior events visited

## User Stories

1. As an attendee living in the Dallas-Fort Worth metroplex, I want to see events happening
in both Dallas and Fort Worth chapters, so I'm exposed to more events.

2. As an organizer, I want specific and accurate background data on the people that
come to my events from different cities, so I can tailor the event experience better.

3. As an attendee who travels frequently, I want to be able to see the events I've
attended across the country and the world, so I can keep track of my demo night experiences.

## Technical Design

1. Update the Chapter model in the database to include location fields
(city, state / region, country, coordinates).
2. Update the admin UI to allow organizers to set and update chapter locations.
3. Create a page for attendees to see a map of their visited event locations.
4. Create a page for organizers to see attendee demographics by location.

## Implementation Plan
1. Update the database schema and run migrations. (1 hour)
2. Update the admin UI for chapter location management. (1 hour)
3. Tag all chapters with appropriate location data. (1-4 hours, can use AI to assist)
4. Implement the attendee event passport page. (2 hours)
5. Implement the organizer demographics page. (2 hours)

## Success Metrics

- Increased event attendance from non-local chapters
- Positive feedback from attendees about event discovery
- Frequent event passport page visits from attendees
