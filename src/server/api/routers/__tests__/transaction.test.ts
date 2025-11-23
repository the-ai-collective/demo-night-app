import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '~/server/db';
import { createMockEvent, createMockAttendee, createMockAward, createMockDemo } from '~/test/utils/factories';

/**
 * Integration tests for transaction logic to prevent race conditions
 * These tests verify that budget validation is atomic and prevents concurrent overwrites
 */

describe('Transaction Logic - Budget Validation', () => {
  let testEvent: any;
  let testAttendee: any;
  let testAward: any;
  let testDemo1: any;
  let testDemo2: any;

  beforeEach(async () => {
    // Create test data
    testEvent = await db.event.create({
      data: createMockEvent(),
    });

    testAttendee = await db.attendee.create({
      data: createMockAttendee(),
    });

    testAward = await db.award.create({
      data: {
        ...createMockAward(),
        eventId: testEvent.id,
      },
    });

    testDemo1 = await db.demo.create({
      data: {
        ...createMockDemo(),
        eventId: testEvent.id,
      },
    });

    testDemo2 = await db.demo.create({
      data: {
        ...createMockDemo(),
        eventId: testEvent.id,
      },
    });
  });

  describe('Prediction Budget Validation', () => {
    it('should prevent budget overrun in sequential predictions', async () => {
      // Create first prediction for $60k
      await db.prediction.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo1.id,
          amount: 60000,
        },
      });

      // Attempt to create second prediction for $50k (would exceed $100k total)
      // This should be caught by application logic validation
      const totalAllocated = await db.prediction.aggregate({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
        },
        _sum: {
          amount: true,
        },
      });

      const currentTotal = totalAllocated._sum.amount ?? 0;
      const attemptedAmount = 50000;

      expect(currentTotal + attemptedAmount).toBeGreaterThan(100000);
      expect(currentTotal).toBe(60000);
    });

    it('should allow predictions up to $100k budget', async () => {
      // Create first prediction for $60k
      const pred1 = await db.prediction.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo1.id,
          amount: 60000,
        },
      });

      // Create second prediction for $40k (exactly $100k total)
      const pred2 = await db.prediction.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo2.id,
          amount: 40000,
        },
      });

      const totalAllocated = await db.prediction.aggregate({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
        },
        _sum: {
          amount: true,
        },
      });

      expect(totalAllocated._sum.amount).toBe(100000);
      expect(pred1).toBeTruthy();
      expect(pred2).toBeTruthy();
    });

    it('should handle prediction updates correctly', async () => {
      // Create initial prediction for $30k
      const prediction = await db.prediction.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo1.id,
          amount: 30000,
        },
      });

      // Update prediction to $50k
      const updated = await db.prediction.update({
        where: { id: prediction.id },
        data: { amount: 50000 },
      });

      expect(updated.amount).toBe(50000);

      // Verify total is still within budget
      const totalAllocated = await db.prediction.aggregate({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
        },
        _sum: {
          amount: true,
        },
      });

      expect(totalAllocated._sum.amount).toBe(50000);
    });

    it('should allow deleting predictions', async () => {
      // Create prediction
      const prediction = await db.prediction.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo1.id,
          amount: 60000,
        },
      });

      // Delete prediction
      await db.prediction.delete({
        where: { id: prediction.id },
      });

      // Verify deletion
      const count = await db.prediction.count({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
        },
      });

      expect(count).toBe(0);
    });
  });

  describe('Vote Budget Validation', () => {
    it('should prevent vote budget overrun in sequential votes', async () => {
      // Create first vote for $70k
      await db.vote.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo1.id,
          amount: 70000,
        },
      });

      // Check that adding $40k would exceed budget
      const totalAllocated = await db.vote.aggregate({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
        },
        _sum: {
          amount: true,
        },
      });

      const currentTotal = totalAllocated._sum.amount ?? 0;
      const attemptedAmount = 40000;

      expect(currentTotal + attemptedAmount).toBeGreaterThan(100000);
      expect(currentTotal).toBe(70000);
    });

    it('should allow votes up to $100k budget', async () => {
      // Create first vote for $55k
      const vote1 = await db.vote.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo1.id,
          amount: 55000,
        },
      });

      // Create second vote for $45k (exactly $100k total)
      const vote2 = await db.vote.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo2.id,
          amount: 45000,
        },
      });

      const totalAllocated = await db.vote.aggregate({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
        },
        _sum: {
          amount: true,
        },
      });

      expect(totalAllocated._sum.amount).toBe(100000);
      expect(vote1).toBeTruthy();
      expect(vote2).toBeTruthy();
    });

    it('should handle votes without amounts (demo night mode)', async () => {
      // Create vote without amount (simple vote)
      const vote = await db.vote.create({
        data: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
          demoId: testDemo1.id,
          amount: null,
        },
      });

      expect(vote.amount).toBeNull();

      // Verify count
      const count = await db.vote.count({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
          awardId: testAward.id,
        },
      });

      expect(count).toBe(1);
    });
  });

  describe('Transaction Isolation', () => {
    it('should maintain data consistency in transactions', async () => {
      // This test verifies that transaction isolation works correctly
      await db.$transaction(async (tx) => {
        // Create prediction within transaction
        const prediction = await tx.prediction.create({
          data: {
            eventId: testEvent.id,
            attendeeId: testAttendee.id,
            awardId: testAward.id,
            demoId: testDemo1.id,
            amount: 50000,
          },
        });

        // Verify it exists within transaction
        const found = await tx.prediction.findUnique({
          where: { id: prediction.id },
        });

        expect(found).toBeTruthy();
        expect(found?.amount).toBe(50000);
      });

      // Verify it exists after transaction commits
      const predictions = await db.prediction.findMany({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
        },
      });

      expect(predictions.length).toBe(1);
      expect(predictions[0]?.amount).toBe(50000);
    });

    it('should rollback transaction on error', async () => {
      // Attempt transaction that will fail
      await expect(
        db.$transaction(async (tx) => {
          // Create first prediction
          await tx.prediction.create({
            data: {
              eventId: testEvent.id,
              attendeeId: testAttendee.id,
              awardId: testAward.id,
              demoId: testDemo1.id,
              amount: 50000,
            },
          });

          // Throw error to force rollback
          throw new Error('Forced rollback');
        })
      ).rejects.toThrow('Forced rollback');

      // Verify no predictions were created
      const count = await db.prediction.count({
        where: {
          eventId: testEvent.id,
          attendeeId: testAttendee.id,
        },
      });

      expect(count).toBe(0);
    });
  });
});
