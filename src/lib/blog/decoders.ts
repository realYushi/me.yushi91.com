/**
 * HTML entity decoders for the blog pipeline.
 * Two implementations: regex (works everywhere) and DOM (client-only).
 * The caller chooses explicitly — no auto-detect wrapper.
 */

/**
 * Decode HTML entities using regex replacement.
 * Works in both server and client environments.
 */
export function decodeWithRegex(text: string): string {
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
 * Decode HTML entities using the browser DOM API.
 * Client-side only — throws if called in a server environment.
 */
export function decodeWithDOM(text: string): string {
  if (typeof document === "undefined") {
    throw new Error("decodeWithDOM requires browser environment");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}
