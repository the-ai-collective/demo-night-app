import validator from "validator";

/**
 * Sanitize text for use in emails
 * - Removes HTML tags
 * - Limits length
 * - Removes newlines that could cause header injection
 */
export function sanitizeEmailText(text: string, maxLength = 500): string {
  if (!text) return "";

  // Remove any HTML tags
  let sanitized = validator.stripLow(text);
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Remove newlines to prevent email header injection
  sanitized = sanitized.replace(/[\r\n]/g, " ");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "...";
  }

  return sanitized;
}

/**
 * Sanitize HTML content for emails
 * Allows safe HTML while removing dangerous content
 * Uses a simple allowlist approach without requiring jsdom
 */
export function sanitizeEmailHTML(html: string): string {
  if (!html) return "";

  // Strip all HTML tags except the allowed ones
  let sanitized = html;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:/gi, "href=");
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*data:/gi, "href=");

  // Only allow specific tags: b, i, em, strong, a, p, br, ul, ol, li
  // Remove all other tags
  sanitized = sanitized.replace(/<(?!\/?(?:b|i|em|strong|a|p|br|ul|ol|li)\b)[^>]+>/gi, "");

  // For <a> tags, only allow href attribute
  sanitized = sanitized.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    const hrefMatch = attrs.match(/href\s*=\s*["']([^"']*)["']/i);
    if (hrefMatch) {
      return `<a href="${hrefMatch[1]}">`;
    }
    return "<a>";
  });

  return sanitized;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  const sanitized = email.trim().toLowerCase();

  if (!validator.isEmail(sanitized)) {
    throw new Error("Invalid email address");
  }

  // Check for disposable email domains (basic check)
  const disposableDomains = [
    "tempmail.com",
    "throwaway.email",
    "guerrillamail.com",
    "10minutemail.com",
    "mailinator.com",
  ];

  const domain = sanitized.split("@")[1];
  if (domain && disposableDomains.includes(domain)) {
    throw new Error("Disposable email addresses are not allowed");
  }

  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (!url) return "";

  const sanitized = url.trim();

  // Validate URL format
  if (!validator.isURL(sanitized, {
    protocols: ["http", "https"],
    require_protocol: true,
  })) {
    throw new Error("Invalid URL");
  }

  // Block dangerous protocols
  if (sanitized.match(/^(javascript|data|vbscript|file):/i)) {
    throw new Error("Invalid URL protocol");
  }

  return sanitized;
}

/**
 * Sanitize name/title fields
 */
export function sanitizeName(name: string, maxLength = 200): string {
  if (!name) return "";

  // Remove HTML and special characters
  let sanitized = validator.stripLow(name);
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Ensure it only contains safe characters
  if (!/^[\p{L}\p{N}\s\-_.']+$/u.test(sanitized)) {
    throw new Error("Name contains invalid characters");
  }

  return sanitized;
}
