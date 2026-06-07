import { describe, expect, it, beforeAll } from "vitest";
import { getLatestPosts } from "../src/lib/rss-client";

describe("getLatestPosts", () => {
  it("fetches and parses RSS feed from blog", { timeout: 10000 }, async () => {
    const posts = await getLatestPosts(3);

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.length).toBeLessThanOrEqual(3);
  });

  it("filters out posts with year 0001", { timeout: 10000 }, async () => {
    const posts = await getLatestPosts(50);

    posts.forEach((post) => {
      expect(post.pubDate.getFullYear()).not.toBe(1);
    });
  });

  it("sorts posts by pubDate descending", { timeout: 10000 }, async () => {
    const posts = await getLatestPosts(10);

    for (let i = 0; i < posts.length - 1; i++) {
      const current = posts[i].pubDate.getTime();
      const next = posts[i + 1].pubDate.getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("limits results to requested count", { timeout: 10000 }, async () => {
    const posts = await getLatestPosts(3);
    expect(posts.length).toBeLessThanOrEqual(3);
  });

  it("returns more posts when count is higher", { timeout: 10000 }, async () => {
    const threePosts = await getLatestPosts(3);
    const fivePosts = await getLatestPosts(5);

    expect(fivePosts.length).toBeGreaterThanOrEqual(threePosts.length);
  });

  it("handles fetch errors gracefully", async () => {
    // Use an invalid URL to trigger an error
    const posts = await getLatestPosts(3, "https://invalid-url-that-does-not-exist.com/feed.xml");

    // Should return empty array instead of throwing
    expect(posts).toEqual([]);
  });

  it("returns posts with required fields", { timeout: 10000 }, async () => {
    const posts = await getLatestPosts(3);

    posts.forEach((post) => {
      expect(post.title).toBeTruthy();
      expect(typeof post.title).toBe("string");

      expect(post.link).toBeTruthy();
      expect(typeof post.link).toBe("string");
      expect(post.link).toMatch(/^https?:\/\//);

      expect(post.pubDate).toBeTruthy();
      expect(post.pubDate instanceof Date).toBe(true);

      expect(post.description).toBeTruthy();
      expect(typeof post.description).toBe("string");
    });
  });
});
