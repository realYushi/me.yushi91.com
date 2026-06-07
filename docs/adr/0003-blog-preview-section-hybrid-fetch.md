# Blog preview section with hybrid fetch

The profile site now includes a "Latest writing" section showing 2-3 recent post previews from the separate Hugo blog. This serves as a recency signal — proving to visitors that Yushi is actively writing — and improves discoverability of the blog beyond a simple text link.

## Considered Options

- **Keep the existing "Blog" link only** — rejected: discoverability and conversion are weak; visitors don't know the blog has content without clicking through.
- **Blog preview with build-time fetch only** — rejected: would require rebuilding the profile site weekly to keep content fresh, which Yushi doesn't want to do.
- **Blog preview with runtime fetch only** — rejected: poor SEO (blog posts not in initial HTML), slower first paint, empty loading state.
- **Blog preview with hybrid fetch** — chosen: build-time fetch renders posts into HTML for SEO and instant loading; runtime fetch updates to fresh content on page load without requiring a rebuild.

## Consequences

- The "blog is out of scope" stance from CONTEXT.md is softened — we now show previews but not full content.
- The section is hidden if fewer than 2 posts are available (after filtering out non-blog pages like "About").
- Runtime fetch failures fall back to build-time posts; at worst, content is a week stale given Yushi's weekly posting cadence.
- RSS source is `https://blog.yushi91.com/index.xml` — standard Hugo RSS feed.
