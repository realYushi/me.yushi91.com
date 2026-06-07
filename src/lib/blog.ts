/**
 * Blog module - entry point for blog-related functionality.
 *
 * This module re-exports the blog interface and functions for backwards compatibility.
 * New code should import directly from the focused modules:
 * - `rss-client.ts` - for fetching blog posts
 * - `rss-parser.ts` - for parsing RSS feeds
 * - `utils.ts` - for formatting utilities
 */

// Re-export types and functions from focused modules
export type { BlogPost } from "./rss-client";
export { getLatestPosts } from "./rss-client";

// Re-export formatting utilities for convenience
export { formatExcerpt } from "./utils";

// RSS parser exports for advanced use cases
export { RSSParser, type RSSFeed, type RSSItem } from "./rss-parser";
