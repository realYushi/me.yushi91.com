/**
 * Post markup generation for the blog section.
 * Single source for post HTML used by both server (Astro) and client (runtime).
 */

import type { BlogPost } from "./types";
import { formatExcerpt, formatDate } from "../utils";

/**
 * Generate post HTML string.
 * Used by both server-side Astro (set:html) and client-side (innerHTML).
 *
 * @param post - Blog post data
 * @param excerptLength - Maximum character length for excerpt (default: 150)
 * @returns HTML string for the post link/article
 */
export function generatePostHTML(post: BlogPost, excerptLength = 150): string {
  const excerpt = formatExcerpt(post.description, excerptLength);
  const dateStr = formatDate(post.pubDate);

  return `
    <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="group grid gap-2 py-7 md:py-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:items-baseline">
      <p class="font-mono text-xs tracking-widest text-muted uppercase">
        ${dateStr}
      </p>
      <div>
        <h3 class="font-display text-2xl md:text-3xl font-semibold tracking-tight group-hover:text-cobalt transition-colors">
          ${post.title}
        </h3>
        <p class="mt-3 text-muted leading-relaxed max-w-2xl">
          ${excerpt}
        </p>
      </div>
    </a>
  `;
}
