# RSS Feed Pipeline Consolidation Plan

## Executive Summary

This plan consolidates the duplicated RSS feed pipeline across server and client code into a single, testable module with environment-specific adapters. The consolidation eliminates code duplication, provides a single source of truth for post markup, and replaces live network calls in tests with inline fixtures.

## Current State Analysis

### Duplication Issues
- `src/lib/rss-client.ts` (server) and `src/lib/client/rss-fetch.ts` (client) duplicate:
  - `BlogPost` interface definition
  - `INVALID_YEAR` constant
  - RSS parsing logic (regex-based)
  - Filter → sort → slice pipeline
  - Post markup (Astro JSX in `index.astro`, `innerHTML` string in `rss-fetch.ts`)

### Decoder Inconsistency
- `src/lib/utils.ts` has three decoder functions:
  - `decodeHTMLEntitiesDOM()` (client-only, throws on server)
  - `decodeHTMLEntitiesRegex()` (works everywhere)
  - `decodeHTMLEntities()` (deprecated auto-detect wrapper)

### Test Issues
- `tests/rss-client.test.ts` and `tests/blog.test.ts` make live network calls
- `tests/rss-parser.test.ts` has inline fixtures (good pattern)
- Tests verify connectivity rather than business intent

## Target Architecture

### New Module Structure
```
src/lib/blog/
├── index.ts                    # Public API: getLatestPosts()
├── types.ts                    # BlogPost interface, constants
├── pipeline.ts                 # Core pipeline: fetch → parse → filter → sort → slice
├── markup.ts                   # Post markup generation (shared by build/runtime)
├── decoders/
│   ├── decoder.ts              # Decoder interface
│   ├── dom-decoder.ts          # Client-side decoder (DOM API)
│   └── regex-decoder.ts        # Server-side decoder (regex)
└── fixtures.ts                 # Test fixtures
```

### Key Design Decisions

1. **Deep Module Pattern**: All blog-related code lives in `src/lib/blog/` with a single public export
2. **Decoder Seam**: Two adapters for HTML entity decoding, selected explicitly by environment
3. **Markup Unification**: Single function generates post HTML, used by both Astro and client-side update
4. **Test Fixtures**: Inline RSS fixtures eliminate network dependency in unit tests

## Implementation Plan

### Phase 1: Create Consolidated Module

#### Step 1.1: Create types and constants
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

**Rationale**: Single source of truth for types and constants, eliminating duplication between server and client modules.

#### Step 1.2: Create decoder interface and implementations
**File**: `src/lib/blog/decoders/decoder.ts`

```typescript
export interface HTMLDecoder {
  decode(text: string): string;
}
```

**File**: `src/lib/blog/decoders/regex-decoder.ts`

```typescript
import { HTMLDecoder } from "./decoder";

export const RegexDecoder: HTMLDecoder = {
  decode(text: string): string {
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
  },
};
```

**File**: `src/lib/blog/decoders/dom-decoder.ts`

```typescript
import { HTMLDecoder } from "./decoder";

export const DOMDecoder: HTMLDecoder = {
  decode(text: string): string {
    if (typeof document === "undefined") {
      throw new Error("DOMDecoder requires browser environment");
    }
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  },
};
```

**Rationale**: Explicit decoder seam with interface pattern. Two implementations for server (regex) and client (DOM). No auto-detect wrapper.

#### Step 1.3: Create core pipeline
**File**: `src/lib/blog/pipeline.ts`

```typescript
import type { HTMLDecoder } from "./decoders/decoder";
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

export async function fetchAndParseRSS(
  url: string,
  decoder: HTMLDecoder,
): Promise<RSSFeed> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const xmlText = await response.text();
  return parseRSS(xmlText, decoder);
}

function parseRSS(xmlText: string, decoder: HTMLDecoder): RSSFeed {
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
  const items: RSSItem[] = itemMatches.map((itemXml) => parseItem(itemXml, decoder));
  return { items };
}

function parseItem(itemXml: string, decoder: HTMLDecoder): RSSItem {
  const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || "";
  const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
  const pubDateStr = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
  const descriptionMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
  const description = descriptionMatch ? descriptionMatch[1] : "";

  return {
    title: decoder.decode(title),
    link,
    pubDate: new Date(pubDateStr),
    description: decoder.decode(description),
  };
}

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
```

**Rationale**: Single pipeline module with decoder as injected dependency. Environment-specific logic isolated to decoder parameter.

#### Step 1.4: Create unified markup generator
**File**: `src/lib/blog/markup.ts`

```typescript
import type { BlogPost } from "./types";
import { formatExcerpt, formatDate } from "../utils";

export interface PostMarkupOptions {
  link: string;
  title: string;
  pubDate: Date;
  description: string;
  excerptLength?: number;
}

export function generatePostHTML(options: PostMarkupOptions): string {
  const { link, title, pubDate, description, excerptLength = 150 } = options;
  const excerpt = formatExcerpt(description, excerptLength);
  const dateStr = formatDate(pubDate);

  return `
    <a href="${link}" target="_blank" rel="noopener noreferrer" class="group grid gap-2 py-7 md:py-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:items-baseline">
      <p class="font-mono text-xs tracking-widest text-muted uppercase">
        ${dateStr}
      </p>
      <div>
        <h3 class="font-display text-2xl md:text-3xl font-semibold tracking-tight group-hover:text-cobalt transition-colors">
          ${title}
        </h3>
        <p class="mt-3 text-muted leading-relaxed max-w-2xl">
          ${excerpt}
        </p>
      </div>
    </a>
  `;
}

export function generatePostArticleElement(post: BlogPost): HTMLAnchorElement {
  const article = document.createElement("article");
  article.className = "border-t border-hairline last:border-b";
  article.setAttribute("data-reveal", "");

  const html = generatePostHTML({
    link: post.link,
    title: post.title,
    pubDate: post.pubDate,
    description: post.description,
  });

  article.innerHTML = html;
  return article;
}
```

**Rationale**: Single source for post markup. `generatePostHTML` for client-side `innerHTML`, `generatePostArticleElement` for DOM manipulation. Both use the same markup structure as Astro components.

#### Step 1.5: Create fixtures for tests
**File**: `src/lib/blog/fixtures.ts`

```typescript
import type { BlogPost } from "./types";

export const SAMPLE_RSS_FEED = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Yushi's Blog</title>
    <link>https://blog.yushi91.com/</link>
    <description>Recent content on Yushi's Blog</description>
    <item>
      <title>Test Post</title>
      <link>https://blog.yushi91.com/test-post/</link>
      <pubDate>Thu, 28 May 2026 10:00:00 +1200</pubDate>
      <description>&lt;p&gt;This is a test post with some content.&lt;/p&gt;</description>
    </item>
    <item>
      <title>Another Post</title>
      <link>https://blog.yushi91.com/another-post/</link>
      <pubDate>Mon, 25 May 2026 15:30:00 +1200</pubDate>
      <description>&lt;p&gt;Another post with different content.&lt;/p&gt;</description>
    </item>
    <item>
      <title>About Page</title>
      <link>https://blog.yushi91.com/about/</link>
      <pubDate>Mon, 01 Jan 0001 00:00:00 +0000</pubDate>
      <description>&lt;p&gt;About page content that should be filtered.&lt;/p&gt;</description>
    </item>
  </channel>
</rss>`;

export const SAMPLE_BLOG_POSTS: BlogPost[] = [
  {
    title: "Test Post",
    link: "https://blog.yushi91.com/test-post/",
    pubDate: new Date("2026-05-28T10:00:00+12:00"),
    description: "<p>This is a test post with some content.</p>",
  },
  {
    title: "Another Post",
    link: "https://blog.yushi91.com/another-post/",
    pubDate: new Date("2026-05-25T15:30:00+12:00"),
    description: "<p>Another post with different content.</p>",
  },
];
```

**Rationale**: Inline fixtures eliminate network dependency in tests. Realistic RSS feed structure for parser testing.

#### Step 1.6: Create public API
**File**: `src/lib/blog/index.ts`

```typescript
import type { BlogPost, BlogPostOptions } from "./types";
import { RegexDecoder } from "./decoders/regex-decoder";
import { INVALID_YEAR, DEFAULT_BLOG_RSS_URL } from "./types";
import { fetchAndParseRSS, filterSortAndSlice } from "./pipeline";

export type { BlogPost, BlogPostOptions };
export { INVALID_YEAR, DEFAULT_BLOG_RSS_URL };

export async function getLatestPosts(options: BlogPostOptions = {}): Promise<BlogPost[]> {
  const { url = DEFAULT_BLOG_RSS_URL, count = 3 } = options;
  
  try {
    const feed = await fetchAndParseRSS(url, RegexDecoder);
    return filterSortAndSlice(feed.items, { count }, INVALID_YEAR);
  } catch (error) {
    return [];
  }
}
```

**Rationale**: Single public API for server-side usage. Defaults to regex decoder for server compatibility.

### Phase 2: Client-Side Runtime Module

#### Step 2.1: Create client-side adapter
**File**: `src/lib/blog/client.ts`

```typescript
import type { BlogPost, BlogPostOptions } from "./types";
import { DOMDecoder } from "./decoders/dom-decoder";
import { INVALID_YEAR, DEFAULT_BLOG_RSS_URL } from "./types";
import { fetchAndParseRSS, filterSortAndSlice } from "./pipeline";
import { generatePostArticleElement } from "./markup";

export { type BlogPost, type BlogPostOptions };

export async function fetchBlogPosts(options: BlogPostOptions = {}): Promise<BlogPost[] | null> {
  const { url = DEFAULT_BLOG_RSS_URL, count = 3 } = options;
  
  try {
    const feed = await fetchAndParseRSS(url, DOMDecoder);
    return filterSortAndSlice(feed.items, { count }, INVALID_YEAR);
  } catch (error) {
    return null;
  }
}

export function updateBlogSection(posts: BlogPost[]): void {
  const section = document.querySelector('[aria-labelledby="latest-writing-heading"]');
  if (!section || posts.length === 0) return;

  const articlesContainer = section.querySelector(".mt-10");
  if (!articlesContainer) return;

  articlesContainer.innerHTML = "";
  posts.forEach((post) => {
    const article = generatePostArticleElement(post);
    articlesContainer.appendChild(article);
  });
}

export async function initFreshBlogPosts(options?: BlogPostOptions): Promise<void> {
  const posts = await fetchBlogPosts(options);
  if (posts && posts.length >= 2) {
    updateBlogSection(posts);
  }
}
```

**Rationale**: Client-specific module using DOM decoder. Reuses core pipeline with different decoder injection. Exports same API shape as old `rss-fetch.ts` for drop-in replacement.

### Phase 3: Update Imports and Delete Old Files

#### Step 3.1: Update Astro component
**File**: `src/pages/index.astro`

Change:
```typescript
import { getLatestPosts, type BlogPost } from "../lib/rss-client";
```

To:
```typescript
import { getLatestPosts, type BlogPost } from "../lib/blog";
```

#### Step 3.2: Update client script
**File**: `src/pages/index.astro` (script section)

Change:
```typescript
import { initFreshBlogPosts } from "../lib/client/rss-fetch.ts";
```

To:
```typescript
import { initFreshBlogPosts } from "../lib/blog/client";
```

#### Step 3.3: Delete deprecated files
- `src/lib/rss-client.ts`
- `src/lib/rss-parser.ts`
- `src/lib/client/rss-fetch.ts`

**Rationale**: Remove duplicated code. New consolidated module replaces all functionality.

### Phase 4: Clean Up Utils

#### Step 4.1: Remove deprecated decoder
**File**: `src/lib/utils.ts`

Delete the `decodeHTMLEntities` function (lines 59-75). Keep `decodeHTMLEntitiesDOM` and `decodeHTMLEntitiesRegex` as they may be used elsewhere.

**Rationale**: Remove deprecated auto-detect wrapper. Explicit decoder selection is now in the blog module.

### Phase 5: Update Tests

#### Step 5.1: Create pipeline unit tests
**File**: `tests/blog-pipeline.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { fetchAndParseRSS, filterSortAndSlice } from "../src/lib/blog/pipeline";
import { RegexDecoder } from "../src/lib/blog/decoders/regex-decoder";
import { INVALID_YEAR } from "../src/lib/blog/types";
import { SAMPLE_RSS_FEED } from "../src/lib/blog/fixtures";

describe("blog pipeline", () => {
  describe("parseRSS", () => {
    it("parses RSS feed into structured data", async () => {
      const feed = await fetchAndParseRSS(SAMPLE_RSS_FEED, RegexDecoder);
      
      expect(feed.items).toHaveLength(3);
      expect(feed.items[0].title).toBe("Test Post");
      expect(feed.items[0].link).toBe("https://blog.yushi91.com/test-post/");
    });

    it("decodes HTML entities", async () => {
      const feed = await fetchAndParseRSS(SAMPLE_RSS_FEED, RegexDecoder);
      
      expect(feed.items[0].description).toBe("<p>This is a test post with some content.</p>");
      expect(feed.items[0].title).not.toContain("&");
    });
  });

  describe("filterSortAndSlice", () => {
    it("filters out posts with year 0001", () => {
      const items = await fetchAndParseRSS(SAMPLE_RSS_FEED, RegexDecoder);
      const filtered = filterSortAndSlice(items.items, { count: 10 }, INVALID_YEAR);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(post => post.pubDate.getFullYear() !== INVALID_YEAR)).toBe(true);
    });

    it("sorts posts by pubDate descending", () => {
      const items = await fetchAndParseRSS(SAMPLE_RSS_FEED, RegexDecoder);
      const sorted = filterSortAndSlice(items.items, { count: 10 }, INVALID_YEAR);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].pubDate.getTime()).toBeGreaterThanOrEqual(sorted[i + 1].pubDate.getTime());
      }
    });

    it("limits results to requested count", () => {
      const items = await fetchAndParseRSS(SAMPLE_RSS_FEED, RegexDecoder);
      const limited = filterSortAndSlice(items.items, { count: 1 }, INVALID_YEAR);
      
      expect(limited).toHaveLength(1);
    });
  });
});
```

**Rationale**: Unit tests for pipeline logic using fixtures. No network calls.

#### Step 5.2: Create decoder tests
**File**: `tests/blog-decoders.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { RegexDecoder } from "../src/lib/blog/decoders/regex-decoder";

describe("RegexDecoder", () => {
  it("decodes basic HTML entities", () => {
    expect(RegexDecoder.decode("&lt;p&gt;Hello&lt;/p&gt;")).toBe("<p>Hello</p>");
    expect(RegexDecoder.decode("&amp;")).toBe("&");
    expect(RegexDecoder.decode("&quot;")).toBe('"');
    expect(RegexDecoder.decode("&apos;")).toBe("'");
  });

  it("decodes curly quote entities", () => {
    expect(RegexDecoder.decode("&ldquo;Hello&rdquo;")).toBe('"Hello"');
    expect(RegexDecoder.decode("&lsquo;Hi&rsquo;")).toBe("'Hi'");
  });

  it("handles text without entities", () => {
    expect(RegexDecoder.decode("Plain text")).toBe("Plain text");
  });
});
```

**Rationale**: Unit tests for decoder implementations.

#### Step 5.3: Create markup generator tests
**File**: `tests/blog-markup.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { generatePostHTML } from "../src/lib/blog/markup";
import { SAMPLE_BLOG_POSTS } from "../src/lib/blog/fixtures";

describe("generatePostHTML", () => {
  it("generates HTML with all required elements", () => {
    const post = SAMPLE_BLOG_POSTS[0];
    const html = generatePostHTML({
      link: post.link,
      title: post.title,
      pubDate: post.pubDate,
      description: post.description,
    });

    expect(html).toContain(post.link);
    expect(html).toContain(post.title);
    expect(html).toMatch(/May.*2026/);
    expect(html).toContain("This is a test post");
  });

  it("uses correct CSS classes", () => {
    const html = generatePostHTML({
      link: "https://example.com",
      title: "Test",
      pubDate: new Date("2026-05-28"),
      description: "<p>Test content</p>",
    });

    expect(html).toContain("font-mono text-xs tracking-widest text-muted uppercase");
    expect(html).toContain("font-display text-2xl md:text-3xl");
    expect(html).toContain("group-hover:text-cobalt");
  });
});
```

**Rationale**: Verify markup structure matches Astro component styling.

#### Step 5.4: Create integration test for public API
**File**: `tests/blog-api.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { getLatestPosts } from "../src/lib/blog";
import { SAMPLE_RSS_FEED } from "../src/lib/blog/fixtures";

// Mock fetch globally
global.fetch = async () => ({
  ok: true,
  text: async () => SAMPLE_RSS_FEED,
}) as Response;

describe("getLatestPosts (integration)", () => {
  it("fetches and processes blog posts", async () => {
    const posts = await getLatestPosts({ count: 3 });

    expect(posts).toHaveLength(2); // 3 items, 1 filtered out (year 0001)
    expect(posts[0].title).toBe("Test Post");
    expect(posts[0].description).toBe("<p>This is a test post with some content.</p>");
  });

  it("handles fetch errors gracefully", async () => {
    global.fetch = async () => ({
      ok: false,
    }) as Response;

    const posts = await getLatestPosts();
    expect(posts).toEqual([]);
  });
});
```

**Rationale**: Integration test with mocked fetch. Verifies end-to-end behavior.

#### Step 5.5: Delete old test files
- `tests/rss-client.test.ts`
- `tests/blog.test.ts` (duplicate functionality)
- `tests/rss-parser.test.ts`

**Rationale**: Remove tests for deleted modules. New tests cover the same ground with fixtures.

### Phase 6: Verification

#### Step 6.1: Build verification
```bash
npm run build
```

Verify:
- Build succeeds without errors
- `dist/index.html` contains blog posts
- Blog section HTML is present

#### Step 6.2: Runtime verification
```bash
npm run preview
```

Verify:
- Blog section displays correctly
- Client-side fetch updates posts
- Fallback to build-time posts works if fetch fails

#### Step 6.3: Test verification
```bash
npm test
```

Verify:
- All new tests pass
- No tests make network calls
- Test suite completes quickly

## Implementation Sequence

### Sequential Steps
1. Create new module structure (`src/lib/blog/`)
2. Implement types, decoders, pipeline, markup, fixtures
3. Implement public API (`src/lib/blog/index.ts`)
4. Implement client adapter (`src/lib/blog/client.ts`)
5. Update `src/pages/index.astro` imports
6. Update tests to use fixtures
7. Delete old files
8. Run build and test verification
9. Commit and test deployment

### Risk Mitigation
- Each step can be tested independently
- Old files remain until new implementation is verified
- Gradual migration minimizes breakage risk
- Tests use fixtures so no network dependency

## Verification Approach

### Pre-Implementation
```bash
# Current state baseline
npm test
npm run build
```

### Post-Implementation
```bash
# All tests pass (with fixtures)
npm test

# Build succeeds
npm run build

# Preview works
npm run preview

# Check for no network calls in tests
grep -r "fetch(" tests/
```

### Success Criteria
1. Build succeeds without errors
2. All tests pass without network calls
3. Blog section displays correctly in preview
4. Client-side fetch updates posts successfully
5. Code duplication eliminated (no repeated BlogPost, INVALID_YEAR, parsing logic)
6. Single source for post markup (no Astro + innerHTML duplication)
7. Deprecated decoder removed from utils.ts
8. Tests verify intent, not connectivity

## Files Changed/Created

### New Files (10)
- `src/lib/blog/types.ts`
- `src/lib/blog/decoders/decoder.ts`
- `src/lib/blog/decoders/regex-decoder.ts`
- `src/lib/blog/decoders/dom-decoder.ts`
- `src/lib/blog/pipeline.ts`
- `src/lib/blog/markup.ts`
- `src/lib/blog/fixtures.ts`
- `src/lib/blog/index.ts`
- `src/lib/blog/client.ts`
- `tests/blog-pipeline.test.ts`
- `tests/blog-decoders.test.ts`
- `tests/blog-markup.test.ts`
- `tests/blog-api.test.ts`

### Modified Files (2)
- `src/pages/index.astro` (update imports)
- `src/lib/utils.ts` (remove deprecated function)

### Deleted Files (6)
- `src/lib/rss-client.ts`
- `src/lib/rss-parser.ts`
- `src/lib/client/rss-fetch.ts`
- `tests/rss-client.test.ts`
- `tests/blog.test.ts`
- `tests/rss-parser.test.ts`

## Post-Implementation Cleanup

### Documentation Updates
- Update ADR-0003 to reference new module structure
- Update CONTEXT.md if needed (blog section already documented)
- Add inline comments to `src/lib/blog/` explaining the architecture

### Performance Considerations
- Verify build-time fetch still works
- Verify client-side fetch doesn't block initial render
- Check bundle size impact (should be similar or smaller due to deduplication)

### Future Considerations
- If decoder needs to support more entities, add to decoder implementations
- If RSS structure changes, update parser regex patterns
- If post markup needs changes, single function to update
