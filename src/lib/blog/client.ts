/**
 * Blog module client-side adapter.
 * Uses DOM decoder and provides runtime DOM update functions.
 */

import type { BlogPost, BlogPostOptions } from "./types";
import { INVALID_YEAR, DEFAULT_BLOG_RSS_URL } from "./types";
import { parseRSS, filterSortAndSlice, fetchRSS } from "./pipeline";
import { decodeWithDOM } from "./decoders";
import { generatePostHTML } from "./markup";

export { type BlogPost, type BlogPostOptions };

/**
 * Fetch and parse blog posts on the client.
 * Returns null on error.
 */
export async function fetchBlogPosts(options: BlogPostOptions = {}): Promise<BlogPost[] | null> {
  const { url = DEFAULT_BLOG_RSS_URL, count = 3 } = options;

  try {
    const xmlText = await fetchRSS(url);
    const feed = parseRSS(xmlText, decodeWithDOM);
    return filterSortAndSlice(feed.items, { count }, INVALID_YEAR);
  } catch {
    return null;
  }
}

/**
 * Update the DOM with fresh blog posts.
 * Finds the blog section and replaces article contents.
 */
export function updateBlogSection(posts: BlogPost[]): void {
  const section = document.querySelector('[aria-labelledby="latest-writing-heading"]');
  if (!section || posts.length === 0) return;

  const articlesContainer = section.querySelector(".mt-10");
  if (!articlesContainer) return;

  articlesContainer.innerHTML = "";
  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "border-t border-hairline last:border-b";
    article.setAttribute("data-reveal", "");
    article.innerHTML = generatePostHTML(post);
    articlesContainer.appendChild(article);
  });
}

/**
 * Initialize fresh blog posts on page load.
 * Fetches posts from the RSS feed and updates the DOM if successful.
 */
export async function initFreshBlogPosts(options?: BlogPostOptions): Promise<void> {
  const posts = await fetchBlogPosts(options);
  if (posts && posts.length >= 2) {
    updateBlogSection(posts);
  }
}
