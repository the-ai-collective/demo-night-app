import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "~/env";

const JWT_SECRET_VALUE = env.NEXTAUTH_SECRET;
if (!JWT_SECRET_VALUE) {
  throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
}
// Type assertion after runtime check ensures TypeScript knows this is a string
const JWT_SECRET: string = JWT_SECRET_VALUE;
const TOKEN_EXPIRY = "24h"; // Tokens expire after 24 hours

export type TokenType = "event" | "demo";

export interface TokenPayload {
  type: TokenType;
  id: string; // eventId or demoId
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT access token for event or demo access
 */
export function generateAccessToken(type: TokenType, id: string): string {
  const payload: TokenPayload = {
    type,
    id,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Verify and decode a JWT access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Type guard to ensure the decoded token matches our payload structure
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "type" in decoded &&
      "id" in decoded
    ) {
      return decoded as TokenPayload;
    }

    throw new Error("Invalid token payload structure");
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Hash a secret using bcrypt
 */
export async function hashSecret(secret: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(secret, salt);
}

/**
 * Verify a secret against a hashed secret
 */
export async function verifySecret(
  secret: string,
  hashedSecret: string,
): Promise<boolean> {
  return bcrypt.compare(secret, hashedSecret);
}

/**
 * Generate a new random secret (CUID format for compatibility)
 */
export function generateSecret(): string {
  // Use crypto.randomBytes for better security than CUID
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}
