export interface Branding {
  isPitchNight: boolean;
  appName: string;
  logoPath: string;
  orgName: string;
}

/**
 * Get branding configuration based on event configuration or hostname
 * @param isPitchNight Whether this is a pitch night event (from event.config.isPitchNight)
 *
 * Priority:
 * 1. If isPitchNight parameter provided (from event config), use it
 * 2. Otherwise, detect from hostname (pitch.aicollective.com or pitch.localhost)
 * 3. Default to Demo Night
 */
export function getBrandingClient(isPitchNight?: boolean): Branding {
  // If explicitly provided from event config, use it
  let finalIsPitchNight: boolean;

  if (isPitchNight !== undefined) {
    finalIsPitchNight = isPitchNight;
  } else {
    // Fallback: Check hostname for pitch.* domains
    finalIsPitchNight = typeof window !== "undefined" &&
      (window.location.hostname === "pitch.aicollective.com" ||
       window.location.hostname === "pitch.localhost" ||
       window.location.hostname.startsWith("pitch."));
  }

  return {
    isPitchNight: finalIsPitchNight,
    appName: finalIsPitchNight ? "Pitch Night" : "Demo Night",
    logoPath: finalIsPitchNight ? "/images/pitch.png" : "/images/logo.png",
    orgName: "The AI Collective",
  };
}
