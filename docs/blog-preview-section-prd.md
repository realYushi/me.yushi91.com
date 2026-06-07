# PRD: Blog Preview Section

## Problem Statement

Visitors to yushi91.com cannot tell that Yushi actively writes technical content. The current site links to the blog (blog.yushi91.com) via a plain text link, but this fails two purposes:

1. **Discoverability** — Visitors may not notice or understand the significance of the blog link
2. **Conversion** — Even visitors who see the link lack context to decide whether clicking through is worth their time

The site needs to signal recency — proving to visitors that Yushi is actively writing — without replicating the full blog content (which lives on a separate Hugo-powered domain).

## Solution

Add a "Latest writing" section to the homepage that displays 2-3 recent blog post previews. Each preview shows:
- Post title (linked to blog.yushi91.com)
- Publication date (absolute format: "May 28, 2026")
- Excerpt (~150 characters, HTML stripped, truncated with "…")

The section appears after the hero and before "Selected projects," matching the visual style of existing sections.

To satisfy both SEO and freshness requirements, the implementation uses **hybrid fetch**:
- **Build-time**: Fetch RSS at build time, render posts into static HTML for crawlers
- **Runtime**: Fetch RSS in the browser, swap in fresh content without requiring a rebuild

## User Stories

1. As a visitor to yushi91.com, I want to see recent blog post previews on the homepage, so that I can understand that Yushi is actively writing technical content
2. As a visitor, I want to see publication dates on blog previews, so that I can judge how recent the content is
3. As a visitor, I want to read excerpts from blog posts, so that I can decide whether clicking through is worth my time
4. As a visitor, I want blog post links to open in a new tab, so that I don't lose my place on the portfolio site
5. As a search engine crawler, I want blog post previews to be present in the initial HTML, so that I can index them for SEO
6. As a returning visitor, I want to see the most recent blog posts (not stale build-time content), so that I get accurate recency information
7. As a visitor, I want the section to match the site's visual style, so that it feels cohesive and professional
8. As Yushi, I want the section to hide if there are fewer than 2 posts available, so that a sparse blog doesn't look incomplete
9. As Yushi, I want non-blog content (like the "About" page) filtered from previews, so that only actual blog posts appear
10. As Yushi, I want the section to show at most 3 posts, so that the homepage doesn't become blog-dominated
11. As a visitor, I want excerpts to be plain text (no HTML), so that formatting doesn't create visual noise or security issues
12. As a visitor, I want excerpts to be truncated at ~150 characters, so that previews are scannable and consistent in length
13. As a visitor, I want the runtime fetch to fall back to build-time posts if it fails, so that I always see something rather than a broken section
14. As Yushi, I want to avoid rebuilding the portfolio site weekly, so that my deployment workflow remains simple
15. As a visitor, I want posts ordered newest first, so that the most recent content is most prominent
16. As Yushi, I want the RSS URL to be configurable, so that I can change it without code changes if needed

## Implementation Decisions

### New module: `src/lib/blog.ts`

A new module that handles blog-related functionality:

- **`fetchBlogPosts()`** — Fetches and parses RSS from `https://blog.yushi91.com/index.xml`
- **`filterValidPosts()`** — Filters out non-blog posts (items with `pubDate` year 0001)
- **`formatBlogDate()`** — Formats RSS date strings to "May 28, 2026" format
- **`truncateExcerpt()`** — Strips HTML, truncates to ~150 chars, appends "…"
- **`getLatestPosts(count)`** — Orchestrates the above, returns sorted posts (newest first, max `count`)

Type shape for a blog post (inferred from RSS):
```typescript
interface BlogPost {
  title: string;
  link: string;
  pubDate: Date;
  excerpt: string;
}
```

### Build-time integration

In `src/pages/index.astro`:
- Import `getLatestPosts` from `src/lib/blog.ts`
- Call it during the build phase (Astro's server-side execution)
- Pass the result to the component as props
- Render the "Latest writing" section with build-time data

### Runtime fetch integration

Add a client-side script that:
- Runs after page load
- Fetches the same RSS URL
- Replaces the build-time posts with fresh data
- Falls back to build-time posts if fetch fails

### Section placement and styling

The section appears after the hero, before "Selected projects":
- Uses the same hairline border pattern as other sections
- Matches the visual style of project cards
- Uses the same typography scale and spacing tokens

### Environment variable

The RSS URL is configurable via `BLOG_RSS_URL` environment variable, defaulting to `https://blog.yushi91.com/index.xml`.

### Filtering rules

- Exclude items where `pubDate` year is 0001 (catches the "About" page)
- Sort by `pubDate` descending (newest first)
- Limit to 3 posts maximum
- Hide entire section if fewer than 2 posts remain after filtering

## Testing Decisions

### What makes a good test

Tests verify external behavior, not implementation details:
- Does the module correctly parse and filter blog posts?
- Does the built HTML contain the expected content?
- Do edge cases (empty feed, filtering, truncation) work correctly?

### Unit tests: `src/lib/blog.ts`

Follows the pattern of `project.test.ts`:
- Test RSS parsing with real feed structure
- Test filtering of "About" page (year 0001)
- Test excerpt truncation and HTML stripping
- Test date formatting
- Test post ordering (newest first)
- Test post limiting (max 3)

### Integration tests: Homepage HTML

Follows the pattern of `deploy-readiness.test.ts`:
- Build the site with `astro build`
- Inspect `dist/index.html`
- Verify "Latest writing" section is present
- Verify build-time posts are in HTML
- Verify posts are linked correctly

### Prior art

- `tests/project.test.ts` — unit tests for domain logic
- `tests/deploy-readiness.test.ts` — integration tests for built HTML
- `tests/metadata.test.ts` — unit tests for metadata utilities

## Out of Scope

- Full blog content replication (the Hugo blog remains the canonical source)
- Blog post comments or social features
- Blog post authorship beyond Yushi
- RSS feed generation (Hugo handles this)
- CMS integration for blog content (Hugo Markdown is the source)
- Real-time updates (build-time + runtime is sufficient)

## Further Notes

### RSS feed details

The Hugo blog generates RSS at `https://blog.yushi91.com/index.xml` with the following structure:
- `<channel>` contains feed metadata
- Each `<item>` represents a post with:
  - `<title>` — post title
  - `<link>` — post URL
  - `<pubDate>` — publication date (RFC 822)
  - `<description>` — HTML content (used for excerpt)
  - `<guid>` — unique identifier

### Hybrid fetch rationale

Pure build-time fetch would require weekly rebuilds (Yushi doesn't want this). Pure runtime fetch has poor SEO (no content in initial HTML). Hybrid fetch gives us:
- SEO: Crawlers see build-time posts in HTML
- Freshness: Humans see fresh posts from runtime fetch
- Simplicity: No weekly rebuilds required

### Weekly posting cadence

Yushi posts weekly. This means:
- Build-time posts are at most a week stale (acceptable)
- Runtime fetch failure is not catastrophic (fallback is still recent)
- The recency signal remains strong even with stale build-time data

### Future considerations

If posting cadence changes, the "hide if fewer than 2 posts" rule may need adjustment. If weekly posting stops, consider removing the section or adjusting the recency signal.
