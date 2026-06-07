/**
 * RSS parser - handles parsing XML RSS feeds into structured data.
 * Provides a clean interface for XML parsing operations.
 */

import { decodeHTMLEntities } from "./utils";

export interface RSSFeed {
  title: string;
  link: string;
  description: string;
  items: RSSItem[];
}

export interface RSSItem {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
}

/**
 * RSS parser namespace for parsing operations.
 * Usage: RSSParser.parse(xmlString)
 */
export const RSSParser = {
  parse,
} as const;

/**
 * Parse RSS XML feed string into structured data.
 *
 * @param xmlText - Raw RSS XML string
 * @returns Parsed RSS feed with items
 *
 * @example
 * const feed = RSSParser.parse(xmlString);
 * console.log(feed.items[0].title);
 */
export function parse(xmlText: string): RSSFeed {
  // Extract channel info
  const channelTitle = xmlText.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/)?.[1] || "";
  const channelLink = xmlText.match(/<channel>[\s\S]*?<link>(.*?)<\/link>/)?.[1] || "";
  const channelDescription = xmlText.match(/<channel>[\s\S]*?<description>(.*?)<\/description>/)?.[1] || "";

  // Extract items
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
  const items: RSSItem[] = itemMatches.map((itemXml) => parseItem(itemXml));

  return {
    title: decodeHTMLEntities(channelTitle),
    link: channelLink,
    description: decodeHTMLEntities(channelDescription),
    items,
  };
}

/**
 * Parse a single RSS item XML string.
 * @internal
 */
function parseItem(itemXml: string): RSSItem {
  const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || "";
  const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
  const pubDateStr = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
  const descriptionMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
  const description = descriptionMatch ? descriptionMatch[1] : "";

  return {
    title: decodeHTMLEntities(title),
    link,
    pubDate: new Date(pubDateStr),
    description: decodeHTMLEntities(description),
  };
}
