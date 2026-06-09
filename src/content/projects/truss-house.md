---
title: Truss House
summary: Marketing site rebuild and customer-facing RAG chatbot for a housing technology company.
role: Full-stack engineer
stack:
  - Astro
  - TypeScript
  - Tailwind CSS
  - Next.js
  - RAG
  - Keystatic
  - Vercel
year: 2026
links:
  - label: Live
    url: https://www.trusshouse.org/
flagship: true
ordering: 1
faq:
  - question: What did Yushi Cui build for Truss House?
    answer: Yushi Cui rebuilt the Truss House marketing site and built a customer-facing RAG chatbot that answers product questions from Truss House documentation.
  - question: What technology stack did the Truss House project use?
    answer: The Truss House project used Astro, TypeScript, Tailwind CSS, Keystatic, and a separate Next.js chatbot on Vercel with semantic search and embeddings.
  - question: How was the Truss House site optimized for search and answer engines?
    answer: The Truss House site uses crawlable HTML, direct page copy, structured content, per-page metadata, and FAQ answers that search and answer engines can read.
citations:
  - label: Astro content collections documentation
    url: https://docs.astro.build/en/guides/content-collections/
  - label: TypeScript documentation
    url: https://www.typescriptlang.org/docs/
  - label: Tailwind CSS documentation
    url: https://tailwindcss.com/docs
  - label: Next.js documentation
    url: https://nextjs.org/docs
  - label: Vercel documentation
    url: https://vercel.com/docs
  - label: Keystatic documentation
    url: https://keystatic.com/docs
  - label: Schema.org FAQPage definition
    url: https://schema.org/FAQPage
  - label: Google Search Central structured data introduction
    url: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
metrics:
  - value: "2026"
    label: production delivery year
  - value: "7"
    label: "core stack choices: Astro, TypeScript, Tailwind CSS, Next.js, RAG, Keystatic, and Vercel"
  - value: "3"
    label: FAQ answers exposed for search and answer engines
  - value: "1"
    label: typed content model used as the source of truth
  - value: "0"
    label: client-side rendering needed for core case-study content
---

Truss House is a housing technology website rebuilt as a calmer marketing site with a customer-facing RAG chatbot. I built the production site end to end, with a focus on static delivery, safer content updates, and product information people could actually find.

The short version: Astro handled the marketing site, Tailwind CSS kept the UI work quick and consistent, TypeScript kept the content model honest, Keystatic gave editors a way to update pages, and a separate Next.js app on Vercel handled the chatbot. RAG kept AI answers tied to Truss House documentation.

## Snapshot

| Signal | Detail |
| --- | --- |
| Delivery year | 2026 |
| Core stack | Astro, TypeScript, Tailwind CSS, Next.js, RAG, Keystatic, Vercel |
| Content model | 1 typed source of truth for project and page data |
| FAQ coverage | 3 concise question-and-answer snippets |
| Crawlability target | 0 client-side rendering needed for core case-study content |

## HTML-first site

Short answer: I made the public housing content static, semantic HTML so visitors, crawlers, and answer engines could read it without running an app shell.

I rebuilt Truss House as a static marketing site: semantic pages, direct copy, and no decorative app shell between a visitor and the product information they needed.

The site uses Astro, so public pages render as crawlable HTML by default. Search engines, answer engines, and normal visitors can read the core housing content without depending on client-side state.

That matched the Astro content-collection model: validate frontmatter before the page ships instead of hoping loose runtime data behaves.

## Typed content + CMS

Short answer: typed content made page data predictable before deploy, and Keystatic let editors update pages without breaking the build shape.

I kept the content model typed so missing fields, malformed links, and half-filled project data fail before they reach production.

Keystatic gave the team a content workflow without turning the site into a custom CMS. The constraint was simple: editors should be able to update the site, and TypeScript should keep project and page data predictable.

Keystatic was a fit because it keeps Git-backed content editable while preserving the structure engineers need for predictable builds.

## Customer-facing RAG chatbot

Short answer: the chatbot was a separate Next.js app on Vercel that used semantic search and embeddings over Truss House product documentation.

I built the chatbot separately from the Astro marketing site so the public pages stayed light. The widget lazy-loads, so it has zero impact on the initial page load for the marketing site.

I shaped the assistant around retrieval instead of loose generation. If it answered a product question, the answer had to come from documentation Truss House controlled.

## SEO/AEO + delivery

Short answer: search visibility came from crawlable HTML, stable URLs, direct headings, per-page metadata, and FAQ answers machines can extract.

Delivery was part of the product: crawlable HTML, per-page metadata, fast loads, and content that search engines and answer engines could find.

The implementation focused on the basics that matter for search visibility: semantic document structure, direct headings, readable page copy, stable URLs, and metadata generated from typed content.

I also treated FAQ answers as real content because the Schema.org FAQPage format gives crawlers a clear question and answer to extract.

## Outcome

Short answer: Truss House got a clearer marketing site, safer content updates, and a customer-facing assistant for product questions.

The result was a public housing technology site with safer content operations, a calmer trade-focused interface, and a chatbot that answers from product documentation without slowing the first page load.

## References

- [Astro content collections documentation](https://docs.astro.build/en/guides/content-collections/) - typed content validation for Astro projects.
- [TypeScript documentation](https://www.typescriptlang.org/docs/) - static typing for content and application code.
- [Tailwind CSS documentation](https://tailwindcss.com/docs) - utility CSS used in the Truss House marketing site.
- [Next.js documentation](https://nextjs.org/docs) - framework used for the separate chatbot app.
- [Vercel documentation](https://vercel.com/docs) - hosting used for the chatbot app.
- [Keystatic documentation](https://keystatic.com/docs) - Git-backed content editing for structured sites.
- [Schema.org FAQPage definition](https://schema.org/FAQPage) - question-and-answer markup used by search systems.
- [Google Search Central structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) - search guidance for machine-readable structured data.

## FAQ

### What did Yushi Cui build for Truss House?

I built the production Truss House website as a typed Astro site with semantic HTML, per-page metadata, static delivery, and AI-assisted workflows around housing content.
I also built the customer-facing chatbot as a separate Next.js app on Vercel, using semantic search and embeddings over Truss House product documentation.

### What technology stack did the Truss House project use?

The project used Astro, TypeScript, Tailwind CSS, Keystatic, and a separate Next.js chatbot on Vercel with semantic search and embeddings.

### How was the Truss House site optimized for search and answer engines?

The site uses crawlable HTML, direct page copy, structured content, per-page metadata, and FAQ answers that search and answer engines can read.
