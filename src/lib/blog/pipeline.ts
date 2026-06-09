/**
 * Blog post pipeline: parse, filter, sort, and slice RSS feeds.
 * Decoder is injected as a dependency — regex on server, DOM on client.
 */

import type { BlogPost, BlogPostOptions } from "./types";

export interface RSSItem {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
}

export interface RSSFeed {
  items: RSSItem[];
}

type Decoder = (text: string) => string;

/**
 * Parse RSS XML string into structured feed.
 * Decoder is injected — regex on server, DOM on client.
 */
export function parseRSS(xmlText: string, decoder: Decoder): RSSFeed {
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
  const items: RSSItem[] = itemMatches.map((itemXml) => parseItem(itemXml, decoder));
  return { items };
}

function parseItem(itemXml: string, decoder: Decoder): RSSItem {
  const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || "";
  const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
  const pubDateStr = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
  const descriptionMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
  const description = descriptionMatch ? descriptionMatch[1] : "";

  return {
    title: decoder(title),
    link,
    pubDate: new Date(pubDateStr),
    description: decoder(description),
  };
}

/**
 * Filter, sort, and limit posts.
 * - Filters out posts with pubDate year 0001 (parsed as 2001 by JS Date)
 * - Sorts by pubDate descending (newest first)
 * - Limits to requested count
 */
export function filterSortAndSlice(
  items: RSSItem[],
  options: BlogPostOptions,
  invalidYear: number,
): BlogPost[] {
  const { count = 3 } = options;
  return items
    .filter((item) => item.pubDate.getFullYear() !== invalidYear)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, count);
}

/**
 * Fetch RSS feed from URL.
 * Throws on error — caller decides how to handle failures.
 */
export async function fetchRSS(url: string, timeoutMs?: number): Promise<string> {
  const controller = timeoutMs ? new AbortController() : null;
  const timeout = controller
    ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const response = await fetch(url, { signal: controller?.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.text();
  } finally {
    if (timeout !== null) {
      globalThis.clearTimeout(timeout);
    }
  }
}
