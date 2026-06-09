/**
 * Blog module types and constants
 */

export interface BlogPost {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
}

export interface BlogPostOptions {
  count?: number;
  timeoutMs?: number;
  url?: string;
}

export const INVALID_YEAR = 2001;
export const DEFAULT_BLOG_RSS_URL = "https://blog.yushi91.com/index.xml";
