/**
 * Blog module public API (server-side).
 * Exports getLatestPosts for use in Astro components.
 */

import type { BlogPost, BlogPostOptions } from "./types";
import { INVALID_YEAR, DEFAULT_BLOG_RSS_URL } from "./types";
import { parseRSS, filterSortAndSlice, fetchRSS } from "./pipeline";
import { decodeWithRegex } from "./decoders";

export type { BlogPost, BlogPostOptions };
export { INVALID_YEAR, DEFAULT_BLOG_RSS_URL };

/**
 * Fetch and parse blog posts from the RSS feed.
 * Returns empty array on error (graceful degradation).
 *
 * @param options - Optional count and RSS URL
 * @returns Array of blog posts, or empty array on error
 */
export async function getLatestPosts(options: BlogPostOptions = {}): Promise<BlogPost[]> {
  const { url = DEFAULT_BLOG_RSS_URL, count = 3 } = options;

  try {
    const xmlText = await fetchRSS(url);
    const feed = parseRSS(xmlText, decodeWithRegex);
    return filterSortAndSlice(feed.items, { count }, INVALID_YEAR);
  } catch {
    return [];
  }
}
