import { describe, expect, it } from "vitest";
import { RSSParser, type RSSFeed, type RSSItem } from "../src/lib/rss-parser";

describe("RSSParser", () => {
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
      <title>Another Post</title>
      <link>https://blog.yushi91.com/another-post/</link>
      <pubDate>Mon, 01 Jan 0001 00:00:00 +0000</pubDate>
      <description>&lt;p&gt;About page content&lt;/p&gt;</description>
    </item>
  </channel>
</rss>`;

  it("parses RSS feed into structured data", () => {
    const feed = RSSParser.parse(sampleRSS);

    expect(feed.title).toBe("Yushi's Blog");
    expect(feed.link).toBe("https://blog.yushi91.com/");
    expect(feed.description).toBe("Recent content on Yushi's Blog");
    expect(feed.items).toHaveLength(2);
  });

  it("decodes HTML entities in feed and items", () => {
    const feed = RSSParser.parse(sampleRSS);

    expect(feed.title).not.toContain("&");
    expect(feed.items[0].description).toBe("<p>This is a test post.</p>");
  });

  it("parses item properties correctly", () => {
    const feed = RSSParser.parse(sampleRSS);
    const item = feed.items[0];

    expect(item.title).toBe("Test Post");
    expect(item.link).toBe("https://blog.yushi91.com/test-post/");
    expect(item.pubDate.getFullYear()).toBe(2026);
    expect(item.description).toBe("<p>This is a test post.</p>");
  });

  it("handles items with year 0001 pubDate", () => {
    const feed = RSSParser.parse(sampleRSS);
    const item = feed.items[1];

    expect(item.title).toBe("Another Post");
    expect(item.pubDate.getFullYear()).toBe(2001); // Year 0001 parsed as 2001 by JS
  });

  it("handles empty RSS feed", () => {
    const emptyRSS = `<?xml version="1.0"?><rss><channel></channel></rss>`;
    const feed = RSSParser.parse(emptyRSS);

    expect(feed.title).toBe("");
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
    const feed = RSSParser.parse(malformedRSS);
    const item = feed.items[0];

    expect(item.title).toBe("Only Title");
    expect(item.link).toBe("");
    expect(item.description).toBe("");
  });
});
