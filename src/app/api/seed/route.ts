import { NextResponse } from "next/server";
import { seed } from "~/server/api/routers/seed";

/**
 * API route to seed the database with test data.
 * 
 * SECURITY: This route should be protected in production.
 * Options:
 * 1. Add a secret token: ?token=your-secret-token
 * 2. Restrict to admin users only
 * 3. Remove this route after seeding
 * 
 * Usage:
 * POST /api/seed?token=your-secret-token
 */
export async function POST(request: Request) {
  try {
    // Optional: Add token-based authentication
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const expectedToken = process.env.SEED_TOKEN;

    // In production, require a token if SEED_TOKEN is set
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json(
        { error: "Unauthorized. Provide ?token=your-secret-token" },
        { status: 401 }
      );
    }

    // Run the seed function
    await seed();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with test data",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for easy browser access (with token)
export async function GET(request: Request) {
  return POST(request);
}

