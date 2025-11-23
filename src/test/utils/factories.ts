import { faker } from '@faker-js/faker';
import type { Chapter, Event, Attendee, Award, Demo } from '@prisma/client';

/**
 * Test data factories for creating mock entities
 */

export const createMockChapter = (overrides?: Partial<Chapter>): Chapter => ({
  id: faker.string.uuid(),
  name: faker.location.city(),
  emoji: faker.helpers.arrayElement(['🌉', '🗽', '🤠', '🦞', '🌴', '🌲', '🏙️', '🏖️', '⛰️', '🎸']),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: faker.string.uuid(),
  name: faker.company.catchPhrase(),
  date: faker.date.future(),
  url: faker.internet.url(),
  config: {},
  secret: faker.string.uuid(),
  chapterId: faker.string.uuid(),
  ...overrides,
});

export const createMockAttendee = (overrides?: Partial<Attendee>): Attendee => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  linkedin: faker.internet.url(),
  type: faker.helpers.arrayElement(['attendee', 'organizer', 'speaker']),
  ...overrides,
});

export const createMockAward = (overrides?: Partial<Award>): Award => ({
  id: faker.string.uuid(),
  eventId: faker.string.uuid(),
  index: faker.number.int({ min: 0, max: 10 }),
  winnerId: null,
  name: faker.lorem.words(2),
  description: faker.lorem.sentence(),
  votable: true,
  ...overrides,
});

export const createMockDemo = (overrides?: Partial<Demo>): Demo => ({
  id: faker.string.uuid(),
  eventId: faker.string.uuid(),
  index: faker.number.int({ min: 0, max: 20 }),
  secret: faker.string.uuid(),
  name: faker.company.catchPhrase(),
  description: faker.lorem.paragraph(),
  email: faker.internet.email(),
  url: faker.internet.url(),
  votable: true,
  ...overrides,
});
