/**
 * Client-side RSS feed fetcher
 *
 * Fetches and parses RSS feeds in the browser, returning structured post data.
 * Handles HTML entity decoding, date parsing, and excerpt formatting.
 *
 * This is the client-side counterpart to src/lib/rss-client.ts.
 * Both modules share the same BlogPost interface and INVALID_YEAR constant.
 */

import { decodeHTMLEntitiesDOM, formatExcerpt, formatDate } from "../utils";

const RSS_URL = "https://blog.yushi91.com/index.xml";

export interface BlogPost {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
}

export interface RssFetchOptions {
  url?: string;
  postCount?: number;
}

/**
 * Filter posts with invalid dates (year 0001 parsed as 2001 by JS Date).
 * Shared constant with rss-client.ts for consistency across server/client.
 */
const INVALID_YEAR = 2001;

/**
 * Fetch and parse RSS feed from the blog
 *
 * Returns array of posts sorted by date (newest first), or null on error.
 * Filters out posts with invalid dates using the same logic as server-side.
 */
export async function fetchBlogPosts(options: RssFetchOptions = {}): Promise<BlogPost[] | null> {
  const { url = RSS_URL, postCount = 3 } = options;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const xmlText = await response.text();

    // Parse RSS items using regex (simple but effective for well-formed feeds)
    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const posts = items
      .map((item) => {
        const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const pubDateStr = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        const descriptionMatch = item.match(/<description>([\s\S]*?)<\/description>/);
        const description = descriptionMatch ? descriptionMatch[1] : "";

        return {
          title: decodeHTMLEntitiesDOM(title),
          link,
          pubDate: new Date(pubDateStr),
          description: decodeHTMLEntitiesDOM(description),
        };
      })
      .filter((post) => post.pubDate.getFullYear() !== INVALID_YEAR) // Filter invalid dates
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()) // Newest first
      .slice(0, postCount);

    return posts;
  } catch {
    return null;
  }
}

/**
 * Update the DOM with fresh blog posts
 *
 * Finds the blog section by aria-labelledby and replaces article contents
 * with the provided posts. Uses the same HTML structure as the server-rendered
 * posts for consistency.
 */
export function updateBlogSection(posts: BlogPost[]): void {
  const section = document.querySelector('[aria-labelledby="latest-writing-heading"]');
  if (!section || posts.length === 0) return;

  const articlesContainer = section.querySelector(".mt-12");
  if (!articlesContainer) return;

  // Clear existing posts
  articlesContainer.innerHTML = "";

  // Add fresh posts
  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "py-6 md:py-8 border-t border-hairline grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start";
    article.setAttribute("data-reveal", "");

    article.innerHTML = `
      <div>
        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="group block">
          <h3 class="font-display text-2xl md:text-3xl font-semibold tracking-tight group-hover:text-teal transition-colors">
            ${post.title}
          </h3>
        </a>
        <p class="mt-2 font-mono text-xs tracking-widest text-muted uppercase">
          ${formatDate(post.pubDate)}
        </p>
        <p class="mt-3 text-muted leading-relaxed max-w-2xl">
          ${formatExcerpt(post.description, 150)}
        </p>
      </div>
    `;

    articlesContainer.appendChild(article);
  });
}

/**
 * Initialize fresh blog posts
 *
 * Fetches posts from the RSS feed and updates the DOM if successful.
 * Requires at least 2 posts to replace server-rendered content.
 */
export async function initFreshBlogPosts(options?: RssFetchOptions): Promise<void> {
  const posts = await fetchBlogPosts(options);
  if (posts && posts.length >= 2) {
    updateBlogSection(posts);
  }
  // If fetch fails or returns fewer than 2 posts, build-time posts remain visible
}
