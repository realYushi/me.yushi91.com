/**
 * Shared utility functions used in both server and client code.
 * Pure functions with no side effects for easy testing and reuse.
 */

/**
 * Decode HTML entities in text.
 * Handles common entities like &lt;, &gt;, &amp;, &nbsp;, etc.
 *
 * @param text - Text containing HTML entities
 * @returns Decoded text
 *
 * @example
 * decodeHTMLEntities("&lt;p&gt;Hello&lt;/p&gt;") // "<p>Hello</p>"
 * decodeHTMLEntities("Yushi's Blog") // "Yushi's Blog"
 */
export function decodeHTMLEntities(text: string): string {
  const textarea = typeof document !== "undefined"
    ? (() => {
        const el = document.createElement("textarea");
        el.innerHTML = text;
        return el;
      })()
    : null;

  if (textarea) {
    return textarea.value;
  }

  // Fallback for server-side: manual entity decoding
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
}

/**
 * Format an excerpt by stripping HTML tags and truncating to max length.
 * Appends "…" ellipsis if content was truncated.
 *
 * @param html - HTML content to format
 * @param maxLength - Maximum character length (default: 150)
 * @returns Plain text excerpt, possibly with ellipsis
 *
 * @example
 * formatExcerpt("<p>Hello world</p>", 50) // "Hello world"
 * formatExcerpt("<p>" + "a".repeat(200) + "</p>", 50) // "aaaaa...aaaa…"
 */
export function formatExcerpt(html: string, maxLength: number = 150): string {
  if (!html) return "";

  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, "").trim();

  // If text fits within limit, return as-is
  if (text.length <= maxLength) {
    return text;
  }

  // Truncate and add ellipsis
  return text.slice(0, maxLength) + "…";
}

/**
 * Format a Date as absolute string (e.g., "May 28, 2026").
 *
 * @param date - Date to format
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date("2026-05-28")) // "May 28, 2026"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
