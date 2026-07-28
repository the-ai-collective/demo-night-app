import { z } from "zod";

import { TAGLINE_MAX_LENGTH } from "./taglineMaxLength";

const URL_HINT = "Enter a valid link, e.g. https://aicollective.com";
const LINKEDIN_HINT = "Enter a linkedin.com link";

/**
 * Founders routinely type "aicollective.com" without a scheme. Add one before
 * validating so a missing "https://" is never what blocks a submission.
 */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseUrl(value: string): URL | null {
  try {
    const url = new URL(normalizeUrl(value));
    // Reject non-web protocols ("ftp://") and bare hostnames ("aicollective").
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url;
  } catch {
    return null;
  }
}

function isLinkedinUrl(value: string): boolean {
  const host = parseUrl(value)?.hostname.toLowerCase();
  return host === "linkedin.com" || (host?.endsWith(".linkedin.com") ?? false);
}

function requiredText(label: string) {
  return z.string().trim().min(1, `${label} is required`);
}

function requiredUrl(label: string) {
  return requiredText(label)
    .refine((value) => parseUrl(value) !== null, URL_HINT)
    .transform(normalizeUrl);
}

/**
 * Shared by the public submission form (via zodResolver) and the tRPC `create`
 * procedure, so client-side and server-side rules can't drift apart. Copy is
 * kept event-type neutral — the form supplies its own Demo/Pitch Night labels.
 */
export const submissionFormSchema = z.object({
  name: requiredText("Startup name"),
  url: requiredUrl("Website"),
  pocName: requiredText("Your name"),
  email: requiredText("Your email").email("Enter a valid email address"),
  pocLinkedin: requiredUrl("Your LinkedIn").refine(
    isLinkedinUrl,
    LINKEDIN_HINT,
  ),
  companyLinkedin: z
    .string()
    .trim()
    .refine((value) => value === "" || isLinkedinUrl(value), LINKEDIN_HINT)
    .transform(normalizeUrl),
  tagline: requiredText("Tagline").max(
    TAGLINE_MAX_LENGTH,
    `Tagline must be ${TAGLINE_MAX_LENGTH} characters or less`,
  ),
  description: requiredText("Description"),
  demoUrl: requiredUrl("Demo video"),
});

export const submissionCreateSchema = submissionFormSchema.extend({
  eventId: z.string(),
});

export type SubmissionFormValues = z.infer<typeof submissionFormSchema>;
