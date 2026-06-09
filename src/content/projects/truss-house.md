---
title: Truss House
summary: Client-facing housing platform rebuilt around typed content, fast search, and AI-assisted workflows.
role: Full-stack engineer
stack:
  - Astro
  - TypeScript
  - RAG
  - Keystatic
year: 2026
links:
  - label: Live
    url: https://www.trusshouse.org/
flagship: true
ordering: 1
faq:
  - question: What did Yushi Cui build for Truss House?
    answer: Yushi Cui built the production Truss House website as a typed, content-driven Astro application with semantic HTML, per-page metadata, fast static delivery, and AI-assisted workflows around housing content.
  - question: What technology stack did the Truss House project use?
    answer: The Truss House project used Astro, TypeScript, Keystatic, and retrieval-augmented generation workflows to support a static-first public website and grounded AI assistance.
  - question: How was the Truss House site optimized for search and answer engines?
    answer: The Truss House site was built with crawlable HTML, direct page copy, structured content, per-page metadata, and content designed to be discoverable by both traditional search engines and answer engines.
citations:
  - label: Astro content collections documentation
    url: https://docs.astro.build/en/guides/content-collections/
  - label: TypeScript documentation
    url: https://www.typescriptlang.org/docs/
  - label: Keystatic documentation
    url: https://keystatic.com/docs
  - label: Schema.org FAQPage definition
    url: https://schema.org/FAQPage
  - label: Google Search Central structured data introduction
    url: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
metrics:
  - value: "2026"
    label: production delivery year
  - value: "4"
    label: "core stack choices: Astro, TypeScript, RAG, and Keystatic"
  - value: "3"
    label: FAQ answers exposed for search and answer engines
  - value: "1"
    label: typed content model used as the source of truth
  - value: "0"
    label: client-side rendering required for core case-study content
---

Truss House is a client-facing housing platform rebuilt as a typed Astro website with Keystatic-managed content, crawlable HTML, and AI-assisted workflows. I built the production site end to end, focusing on fast static delivery, safer content operations, and search-friendly housing information.

In short: the project combined Astro's static HTML delivery, TypeScript-backed content modelling, Keystatic editorial workflows, and grounded retrieval-augmented generation so housing information stayed readable by people, search engines, and answer engines.

## Snapshot

| Signal | Detail |
| --- | --- |
| Delivery year | 2026 |
| Core stack | Astro, TypeScript, RAG, Keystatic |
| Content model | 1 typed source of truth for project and page data |
| FAQ coverage | 3 concise question-and-answer snippets |
| Crawlability target | 0 client-side rendering required for core case-study content |

## HTML-first site

Answer first: I made the public housing content available as static, semantic HTML so visitors, search crawlers, and answer engines could read the page without running an app shell.

I rebuilt Truss House as a fast, static-first public surface: semantic pages, direct copy, and no decorative app shell getting between a visitor and the housing information they needed.

The site uses Astro so public pages render as crawlable HTML by default. That made the core housing content easier for visitors, search engines, and answer engines to parse without depending on client-side application state.

This matched Astro's content-collection model, where frontmatter is validated and transformed before pages ship, instead of relying on loose runtime data.

## Typed content + CMS

Answer first: I used typed content to make project and page data predictable before deployment, then paired it with Keystatic so editors could update content without breaking the build shape.

I kept the content model typed so missing fields, malformed links, and half-filled project data fail before they reach production.

Keystatic gave the team a content workflow without turning the site into a fragile custom CMS. The important constraint was simple: content editors should be able to update the site, while TypeScript keeps the shape of project and page data predictable.

Keystatic was a fit because it keeps Git-backed content editable while preserving the structure engineers need for predictable builds.

## Grounded RAG assistant

Answer first: The AI workflow was designed around grounded retrieval, not open-ended generation, so support answers stayed tied to Truss House content.

I shaped the assistant around grounded retrieval instead of loose generation, so answers stayed tied to the organisation's own housing content and support workflow.

For this project, the goal of retrieval-augmented generation was not to make the assistant sound creative. The goal was to keep answers anchored to source content that Truss House controlled.

## SEO/AEO + delivery

Answer first: The search strategy relied on crawlable HTML, stable URLs, direct headings, per-page metadata, and FAQ-shaped answers that machines can extract cleanly.

I treated delivery as part of the product: crawlable HTML, per-page metadata, fast loads, and content that could be found by both search engines and answer engines.

The implementation focused on the basics that matter for search visibility: semantic document structure, direct headings, readable page copy, stable URLs, and metadata generated from typed content.

I also treated FAQ-style answers as first-class content because Schema.org's FAQPage format gives crawlers a clear question, answer, and entity structure to extract.

## Outcome

Answer first: Truss House ended up with a clearer public site, safer content operations, and AI-assisted workflows around the housing support journey.

The result was a client-facing housing platform with a clearer public site, safer content operations, and AI-assisted workflows around the support journey.

## References

- [Astro content collections documentation](https://docs.astro.build/en/guides/content-collections/) — typed content validation for Astro projects.
- [TypeScript documentation](https://www.typescriptlang.org/docs/) — static typing used to keep content and application code predictable.
- [Keystatic documentation](https://keystatic.com/docs) — Git-backed content editing for structured sites.
- [Schema.org FAQPage definition](https://schema.org/FAQPage) — structured question-and-answer markup used by search systems.
- [Google Search Central structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) — search-engine guidance for machine-readable structured data.

## FAQ

### What did Yushi Cui build for Truss House?

I built the production Truss House website as a typed, content-driven Astro application with semantic HTML, per-page metadata, fast static delivery, and AI-assisted workflows around housing content.

### What technology stack did the Truss House project use?

The project used Astro, TypeScript, Keystatic, and retrieval-augmented generation workflows to support a static-first public website and grounded AI assistance.

### How was the Truss House site optimized for search and answer engines?

The site was built with crawlable HTML, direct page copy, structured content, per-page metadata, and content designed to be discoverable by both traditional search engines and answer engines.
