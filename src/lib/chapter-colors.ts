/**
 * Generate a consistent color for a chapter based on its name
 * Uses a simple hash function to convert the chapter name into a hue value,
 * then generates a pleasant color with good saturation and lightness
 */
export function getChapterColor(chapterName: string): string {
  // Simple hash function to convert string to a number
  let hash = 0;
  for (let i = 0; i < chapterName.length; i++) {
    hash = chapterName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to hue (0-360)
  const hue = Math.abs(hash % 360);

  // Use fixed saturation and lightness for consistent, pleasant colors
  // Saturation: 60-70% for vibrant but not overwhelming colors
  // Lightness: 45-55% for good contrast against both light and dark text
  const saturation = 65;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a Tailwind CSS class for chapter colors
 * Returns a style object since Tailwind can't generate arbitrary colors at build time
 */
export function getChapterColorStyle(chapterName: string) {
  return {
    backgroundColor: getChapterColor(chapterName),
  };
}

/**
 * Generate a lighter version of the chapter color for backgrounds
 */
export function getChapterColorLight(chapterName: string): string {
  let hash = 0;
  for (let i = 0; i < chapterName.length; i++) {
    hash = chapterName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  const hue = Math.abs(hash % 360);
  const saturation = 50; // Lower saturation for backgrounds
  const lightness = 90; // Much lighter for backgrounds

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
