/**
 * RSS client - handles fetching RSS feeds from external sources.
 * Provides a clean interface for network operations with error handling.
 *
 * This is the server-side counterpart to src/lib/client/rss-fetch.ts.
 * Both modules share the same BlogPost interface and INVALID_YEAR constant.
 */

import { RSSParser, type RSSFeed, type RSSItem } from "./rss-parser";

export interface BlogPost {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
}

const DEFAULT_BLOG_RSS_URL = "https://blog.yushi91.com/index.xml";

/**
 * Filter posts with invalid dates (year 0001 parsed as 2001 by JS Date).
 * Shared constant with client/rss-fetch.ts for consistency.
 */
const INVALID_YEAR = 2001;

/**
 * Fetch and parse RSS feed from the blog.
 * Returns posts filtered, sorted, and limited as specified.
 *
 * @param count - Maximum number of posts to return (default: 3)
 * @param rssUrl - RSS feed URL (default: blog.yushi91.com)
 * @returns Array of blog posts, empty array on error
 *
 * @example
 * const posts = await getLatestPosts(5);
 * const posts = await getLatestPosts(10, "https://other.com/feed.xml");
 */
export async function getLatestPosts(
  count: number = 3,
  rssUrl: string = DEFAULT_BLOG_RSS_URL,
): Promise<BlogPost[]> {
  try {
    const feed = await fetchRSSFeed(rssUrl);
    return filterAndSortPosts(feed.items, count);
  } catch (error) {
    // Return empty array on fetch/parse error
    // Callers can decide whether to show empty state or fallback content
    return [];
  }
}

/**
 * Fetch raw RSS feed from URL.
 * @internal
 */
async function fetchRSSFeed(url: string): Promise<RSSFeed> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const xmlText = await response.text();
  return RSSParser.parse(xmlText);
}

/**
 * Filter, sort, and limit posts.
 * - Filters out posts with pubDate year 0001 (parsed as 2001 by JS)
 * - Sorts by pubDate descending (newest first)
 * - Limits to requested count
 * @internal
 */
function filterAndSortPosts(items: RSSItem[], count: number): BlogPost[] {
  return items
    .filter((item) => item.pubDate.getFullYear() !== INVALID_YEAR)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, count);
}
