import { describe, expect, it } from "vitest";
import { getLatestPosts } from "../src/lib/blog";

describe("getLatestPosts", () => {
  it("fetches and parses RSS feed into blog posts", async () => {
    const posts = await getLatestPosts(5);

    // Should return an array
    expect(Array.isArray(posts)).toBe(true);

    // Should have posts
    expect(posts.length).toBeGreaterThan(0);

    // Each post should have required fields
    posts.forEach((post) => {
      expect(post.title).toBeTruthy();
      expect(typeof post.title).toBe("string");

      expect(post.link).toBeTruthy();
      expect(typeof post.link).toBe("string");
      expect(post.link).toMatch(/^https:\/\//);

      expect(post.pubDate).toBeTruthy();
      expect(post.pubDate instanceof Date).toBe(true);

      expect(post.description).toBeTruthy();
      expect(typeof post.description).toBe("string");
    });
  });

  it("filters out posts with pubDate year 0001", async () => {
    const posts = await getLatestPosts(50);

    // No post should have year 0001 (the About page)
    posts.forEach((post) => {
      expect(post.pubDate.getFullYear()).not.toBe(1);
    });
  });

  it("sorts posts by pubDate descending (newest first)", async () => {
    const posts = await getLatestPosts(10);

    // Posts should be ordered newest first
    for (let i = 0; i < posts.length - 1; i++) {
      const current = posts[i].pubDate.getTime();
      const next = posts[i + 1].pubDate.getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("limits results to requested count", async () => {
    const posts = await getLatestPosts(3);

    expect(posts.length).toBeLessThanOrEqual(3);
  });

  it("returns more posts when count is higher", async () => {
    const threePosts = await getLatestPosts(3);
    const fivePosts = await getLatestPosts(5);

    expect(fivePosts.length).toBeGreaterThanOrEqual(threePosts.length);
  });
});
