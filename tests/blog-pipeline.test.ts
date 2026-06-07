import { describe, expect, it } from "vitest";
import { parseRSS, filterSortAndSlice } from "../src/lib/blog/pipeline";
import { decodeWithRegex } from "../src/lib/blog/decoders";
import { INVALID_YEAR } from "../src/lib/blog/types";

const sampleRSS = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Yushi's Blog</title>
    <link>https://blog.yushi91.com/</link>
    <description>Recent content on Yushi's Blog</description>
    <item>
      <title>Test Post</title>
      <link>https://blog.yushi91.com/test-post/</link>
      <pubDate>Thu, 28 May 2026 10:00:00 +1200</pubDate>
      <description>&lt;p&gt;This is a test post.&lt;/p&gt;</description>
    </item>
    <item>
      <title>Older Post</title>
      <link>https://blog.yushi91.com/older-post/</link>
      <pubDate>Mon, 25 May 2026 15:30:00 +1200</pubDate>
      <description>&lt;p&gt;Older content here.&lt;/p&gt;</description>
    </item>
    <item>
      <title>About Page</title>
      <link>https://blog.yushi91.com/about/</link>
      <pubDate>Mon, 01 Jan 0001 00:00:00 +0000</pubDate>
      <description>&lt;p&gt;About page that should be filtered out.&lt;/p&gt;</description>
    </item>
  </channel>
</rss>`;

describe("blog pipeline", () => {
  describe("parseRSS", () => {
    it("parses RSS feed into structured data", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);

      expect(feed.items).toHaveLength(3);
      expect(feed.items[0].title).toBe("Test Post");
      expect(feed.items[0].link).toBe("https://blog.yushi91.com/test-post/");
      expect(feed.items[1].title).toBe("Older Post");
    });

    it("decodes HTML entities in feed items", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);

      expect(feed.items[0].description).toBe("<p>This is a test post.</p>");
      expect(feed.items[0].title).not.toContain("&");
    });

    it("handles empty RSS feed", () => {
      const emptyRSS = `<?xml version="1.0"?><rss><channel></channel></rss>`;
      const feed = parseRSS(emptyRSS, decodeWithRegex);

      expect(feed.items).toHaveLength(0);
    });

    it("handles malformed item gracefully", () => {
      const malformedRSS = `<?xml version="1.0"?>
<rss>
  <channel>
    <item>
      <title>Only Title</title>
    </item>
  </channel>
</rss>`;
      const feed = parseRSS(malformedRSS, decodeWithRegex);
      const item = feed.items[0];

      expect(item.title).toBe("Only Title");
      expect(item.link).toBe("");
      expect(item.description).toBe("");
    });
  });

  describe("filterSortAndSlice", () => {
    it("filters out posts with year 0001", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);
      const posts = filterSortAndSlice(feed.items, { count: 10 }, INVALID_YEAR);

      expect(posts).toHaveLength(2);
      expect(posts.every((post) => post.pubDate.getFullYear() !== INVALID_YEAR)).toBe(true);
    });

    it("sorts posts by pubDate descending (newest first)", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);
      const posts = filterSortAndSlice(feed.items, { count: 10 }, INVALID_YEAR);

      for (let i = 0; i < posts.length - 1; i++) {
        expect(posts[i].pubDate.getTime()).toBeGreaterThanOrEqual(posts[i + 1].pubDate.getTime());
      }
    });

    it("limits results to requested count", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);
      const posts = filterSortAndSlice(feed.items, { count: 1 }, INVALID_YEAR);

      expect(posts).toHaveLength(1);
    });

    it("returns empty array when no valid posts", () => {
      const posts = filterSortAndSlice([], { count: 3 }, INVALID_YEAR);
      expect(posts).toEqual([]);
    });
  });
});
