import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { generateAccessToken } from "~/lib/auth-tokens";
import { authRateLimiter, getClientIdentifier } from "~/lib/rate-limit";

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  return crypto.timingSafeEqual(bufferA, bufferB);
}

export const authTokenRouter = createTRPCRouter({
  /**
   * Exchange an event secret for a JWT access token
   */
  getEventToken: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        secret: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Additional strict rate limiting for auth endpoints
      const identifier = getClientIdentifier(ctx.headers);
      const { success } = await authRateLimiter.limit(identifier);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many authentication attempts. Please try again later.",
        });
      }

      const event = await db.event.findUnique({
        where: { id: input.eventId },
        select: { secret: true },
      });

      // Always add delay to prevent timing attacks on event existence
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!event || !constantTimeCompare(event.secret, input.secret)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid event secret",
        });
      }

      const token = generateAccessToken("event", input.eventId);
      return { token };
    }),

  /**
   * Exchange a demo secret for a JWT access token
   */
  getDemoToken: publicProcedure
    .input(
      z.object({
        demoId: z.string(),
        secret: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Additional strict rate limiting for auth endpoints
      const identifier = getClientIdentifier(ctx.headers);
      const { success } = await authRateLimiter.limit(identifier);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many authentication attempts. Please try again later.",
        });
      }

      const demo = await db.demo.findUnique({
        where: { id: input.demoId },
        select: { secret: true },
      });

      // Always add delay to prevent timing attacks on demo existence
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!demo || !constantTimeCompare(demo.secret, input.secret)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid demo secret",
        });
      }

      const token = generateAccessToken("demo", input.demoId);
      return { token };
    }),
});
