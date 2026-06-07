# RSS Feed Pipeline Consolidation

## Context

The blog-preview feed is one module fractured across the server/client seam. Four problems, all stemming from the same duplication:

1. **Candidate 1** (Strong): `fetch · parse · filter · sort · slice`, `BlogPost`, `INVALID_YEAR`, and the feed URL are all written twice — `rss-client.ts` + `rss-parser.ts` vs `client/rss-fetch.ts`. The only thing that genuinely varies is the entity decoder (DOM vs regex).

2. **Candidate 2** (Worth exploring): `decodeHTMLEntities` in `utils.ts` is a deprecated auto-detect wrapper that the server parser calls, but its DOM branch never runs server-side. A try/catch pass-through — fails the deletion test.

3. **Candidate 3** (Worth exploring): Post markup exists as Astro JSX in `index.astro` *and* as an `innerHTML` string in `rss-fetch.ts`. A code comment admits they "must mirror exactly."

4. **Candidate 4** (Worth exploring): `blog.test.ts` and `rss-client.test.ts` fetch `blog.yushi91.com` for real — the happy-path tests verify connectivity, not the filter/sort/slice intent.

## Recommended Approach

Create `src/lib/blog/` as one deep module that owns the entire pipeline. The decoder becomes the only seam — two explicit adapters, no auto-detect.

### New Module Structure

```
src/lib/blog/
├── index.ts          # Public API: getLatestPosts()
├── pipeline.ts       # Core pipeline: parse → filter → sort → slice
├── decoders.ts       # HTML entity decoders (DOM + regex)
└── client.ts         # Client-side adapter with DOM decoder
```

### Key Design Decisions

1. **Decoder seam, not guessed** — two decoder functions, chosen explicitly by caller. No auto-detect wrapper.
2. **Fixtures inline in tests** — follows existing pattern (see `tests/rss-parser.test.ts`).
3. **Markup via template string function** — single `generatePostHTML()` used by both build (via `set:html`) and runtime (via `innerHTML`).
4. **Pipeline uses fetch for real, fixtures for tests** — `pipeline.ts` accepts XML string directly; tests inline the fixture.

## Implementation Steps

### Step 1: Create the consolidated blog module

**File**: `src/lib/blog/types.ts`
```typescript
export interface BlogPost {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
}

export interface BlogPostOptions {
  count?: number;
  url?: string;
}

export const INVALID_YEAR = 2001;
export const DEFAULT_BLOG_RSS_URL = "https://blog.yushi91.com/index.xml";
```

**File**: `src/lib/blog/decoders.ts`
```typescript
/**
 * Decode HTML entities using regex (works everywhere).
 */
export function decodeWithRegex(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
}

/**
 * Decode HTML entities using DOM API (client-only).
 */
export function decodeWithDOM(text: string): string {
  if (typeof document === "undefined") {
    throw new Error("decodeWithDOM requires browser environment");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}
```

**File**: `src/lib/blog/pipeline.ts`
```typescript
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
 * Filters out year-0001 posts, sorts descending, limits to count.
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
 * Fetch RSS feed from URL and parse it.
 * Throws on error — caller decides what to return.
 */
export async function fetchRSS(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.text();
}
```

**File**: `src/lib/blog/index.ts` (server-side public API)
```typescript
import type { BlogPost, BlogPostOptions } from "./types";
import { INVALID_YEAR, DEFAULT_BLOG_RSS_URL } from "./types";
import { parseRSS, filterSortAndSlice, fetchRSS } from "./pipeline";
import { decodeWithRegex } from "./decoders";

export type { BlogPost, BlogPostOptions };
export { INVALID_YEAR, DEFAULT_BLOG_RSS_URL };

/**
 * Fetch and parse blog posts.
 * Returns empty array on error (graceful degradation).
 */
export async function getLatestPosts(options: BlogPostOptions = {}): Promise<BlogPost[]> {
  const { url = DEFAULT_BLOG_RSS_URL, count = 3 } = options;

  try {
    const xmlText = await fetchRSS(url);
    const feed = parseRSS(xmlText, decodeWithRegex);
    return filterSortAndSlice(feed.items, { count }, INVALID_YEAR);
  } catch {
    return [];
  }
}
```

**File**: `src/lib/blog/markup.ts`
```typescript
import type { BlogPost } from "./types";
import { formatExcerpt, formatDate } from "../utils";

/**
 * Generate post HTML string.
 * Used by both server-side Astro (set:html) and client-side (innerHTML).
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
```

**File**: `src/lib/blog/client.ts` (client-side adapter)
```typescript
import type { BlogPost, BlogPostOptions } from "./types";
import { INVALID_YEAR, DEFAULT_BLOG_RSS_URL } from "./types";
import { parseRSS, filterSortAndSlice, fetchRSS } from "./pipeline";
import { decodeWithDOM } from "./decoders";
import { generatePostHTML } from "./markup";

export { type BlogPost, type BlogPostOptions };

/**
 * Fetch and parse blog posts on client.
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
 */
export async function initFreshBlogPosts(options?: BlogPostOptions): Promise<void> {
  const posts = await fetchBlogPosts(options);
  if (posts && posts.length >= 2) {
    updateBlogSection(posts);
  }
}
```

### Step 2: Update imports in `src/pages/index.astro`

**Change server import:**
```diff
-import { getLatestPosts, type BlogPost } from "../lib/rss-client";
+import { getLatestPosts, type BlogPost } from "../lib/blog";
```

**Change client script import:**
```diff
-import { initFreshBlogPosts } from "../lib/client/rss-fetch.ts";
+import { initFreshBlogPosts } from "../lib/blog/client";
```

**Update post rendering to use unified markup** (the `<article>` loop):

Replace the inner `<a>` tag with `set:html`:

```astro
<article data-reveal class="border-t border-hairline" set:html={generatePostHTML(post)} />
```

And add the import:
```astro
import { generatePostHTML } from "../lib/blog/markup";
```

### Step 3: Delete deprecated decoder

**File**: `src/lib/utils.ts`

Delete the `decodeHTMLEntities` function (lines 69-75). Keep `decodeHTMLEntitiesDOM` and `decodeHTMLEntitiesRegex` for other potential uses.

### Step 4: Update tests

**New file**: `tests/blog-pipeline.test.ts`
```typescript
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
      <title>Old Post</title>
      <link>https://blog.yushi91.com/old-post/</link>
      <pubDate>Mon, 25 May 2026 15:30:00 +1200</pubDate>
      <description>&lt;p&gt;Older content.&lt;/p&gt;</description>
    </item>
    <item>
      <title>About Page</title>
      <link>https://blog.yushi91.com/about/</link>
      <pubDate>Mon, 01 Jan 0001 00:00:00 +0000</pubDate>
      <description>&lt;p&gt;About page.&lt;/p&gt;</description>
    </item>
  </channel>
</rss>`;

describe("blog pipeline", () => {
  describe("parseRSS", () => {
    it("parses and decodes RSS feed", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);

      expect(feed.items).toHaveLength(3);
      expect(feed.items[0].title).toBe("Test Post");
      expect(feed.items[0].description).toBe("<p>This is a test post.</p>");
    });
  });

  describe("filterSortAndSlice", () => {
    it("filters out year 0001 posts", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);
      const posts = filterSortAndSlice(feed.items, { count: 10 }, INVALID_YEAR);

      expect(posts).toHaveLength(2);
      expect(posts.every((p) => p.pubDate.getFullYear() !== INVALID_YEAR)).toBe(true);
    });

    it("sorts by date descending", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);
      const posts = filterSortAndSlice(feed.items, { count: 10 }, INVALID_YEAR);

      for (let i = 0; i < posts.length - 1; i++) {
        expect(posts[i].pubDate.getTime()).toBeGreaterThanOrEqual(posts[i + 1].pubDate.getTime());
      }
    });

    it("limits to requested count", () => {
      const feed = parseRSS(sampleRSS, decodeWithRegex);
      const posts = filterSortAndSlice(feed.items, { count: 1 }, INVALID_YEAR);

      expect(posts).toHaveLength(1);
    });
  });
});
```

**New file**: `tests/blog-decoders.test.ts`
```typescript
import { describe, expect, it } from "vitest";
import { decodeWithRegex } from "../src/lib/blog/decoders";

describe("decodeWithRegex", () => {
  it("decodes basic HTML entities", () => {
    expect(decodeWithRegex("&lt;p&gt;Hello&lt;/p&gt;")).toBe("<p>Hello</p>");
    expect(decodeWithRegex("&amp;")).toBe("&");
    expect(decodeWithRegex("&quot;")).toBe('"');
  });

  it("decodes curly quotes", () => {
    expect(decodeWithRegex("&ldquo;Hello&rdquo;")).toBe('"Hello"');
    expect(decodeWithRegex("&lsquo;Hi&rsquo;")).toBe("'Hi'");
  });
});
```

**Delete old test files**:
- `tests/rss-client.test.ts`
- `tests/blog.test.ts`
- `tests/rss-parser.test.ts`

**Update integration tests** (`tests/blog-preview-section.test.ts`, `tests/blog-runtime-fetch.test.ts`) — these should continue passing as they test the build output, not the internals.

### Step 5: Delete old modules

```
src/lib/rss-client.ts
src/lib/rss-parser.ts
src/lib/client/rss-fetch.ts
```

## Verification

### Build and preview
```bash
npm run build
npm run preview
```

Verify:
- Build succeeds
- Blog section displays correctly
- Client-side fetch updates posts

### Run tests
```bash
npm test
```

Verify:
- All new tests pass
- Integration tests still pass (they test build output)
- No tests make network calls (check: `grep -r "blog.yushi91.com" tests/` should only be in integration tests checking the generated HTML)

### Success criteria
- [ ] Build succeeds
- [ ] All tests pass
- [ ] Blog section works in preview
- [ ] Client-side refresh works
- [ ] No code duplication: `BlogPost`, `INVALID_YEAR`, parsing logic exist once
- [ ] Post markup generated from one function
- [ ] Deprecated decoder removed
- [ ] Tests use fixtures, not live network (except smoke tests)

## Files changed

**New (8)**:
- `src/lib/blog/types.ts`
- `src/lib/blog/decoders.ts`
- `src/lib/blog/pipeline.ts`
- `src/lib/blog/markup.ts`
- `src/lib/blog/index.ts`
- `src/lib/blog/client.ts`
- `tests/blog-pipeline.test.ts`
- `tests/blog-decoders.test.ts`

**Modified (2)**:
- `src/pages/index.astro` (imports + rendering)
- `src/lib/utils.ts` (delete deprecated function)

**Deleted (6)**:
- `src/lib/rss-client.ts`
- `src/lib/rss-parser.ts`
- `src/lib/client/rss-fetch.ts`
- `tests/rss-client.test.ts`
- `tests/blog.test.ts`
- `tests/rss-parser.test.ts`
