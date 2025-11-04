/**
 * Helper function to properly escape CSV field values.
 * Handles newlines, tabs, quotes, and other problematic characters.
 */
export function escapeCsvField(value: string | null | undefined): string {
  if (!value) return "";
  // Replace newlines and tabs with spaces, trim multiple spaces
  // Replace double quotes with single quotes to avoid CSV parsing issues
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .trim();
}

/**
 * Escape all string fields in an object for CSV export
 */
export function escapeCsvObject<T extends Record<string, any>>(
  obj: T,
): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === "string") {
      result[key] = escapeCsvField(result[key]) as any;
    }
  }
  return result;
}
