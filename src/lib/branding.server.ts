import { headers } from "next/headers";

import { type Branding } from "./branding";

/**
 * Get branding configuration based on event configuration or hostname
 * @param isPitchNight Whether this is a pitch night event (from event.config.isPitchNight)
 *
 * SERVER ONLY - Use this only in Server Components
 *
 * Priority:
 * 1. If isPitchNight parameter provided (from event config), use it
 * 2. Otherwise, detect from host header (pitches.aicollective.com or pitches.localhost)
 * 3. Default to Demo Night
 */
export async function getBranding(isPitchNight?: boolean): Promise<Branding> {
  // If explicitly provided from event config, use it
  let finalIsPitchNight: boolean;

  if (isPitchNight !== undefined) {
    finalIsPitchNight = isPitchNight;
  } else {
    // Fallback: Check host header for pitch.* domains
    const headersList = headers();
    const host = headersList.get("host") ?? "";
    finalIsPitchNight =
      host.startsWith("pitches.") ||
      host === "pitches.localhost:3000" ||
      host === "pitches.localhost";
  }

  return {
    isPitchNight: finalIsPitchNight,
    appName: finalIsPitchNight ? "Pitch Night" : "Demo Night",
    logoPath: finalIsPitchNight ? "/images/pitch.png" : "/images/logo.png",
    orgName: "The AI Collective",
  };
}
