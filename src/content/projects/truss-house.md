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
image: /projects/truss-house
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
---

Truss House is a housing technology company. I rebuilt their marketing site and built a chatbot that answers product questions from their own documentation. The whole thing ships as static pages, so updates are safe and people can actually find the product information they came for.

Astro runs the marketing site. Tailwind kept the styling fast to write. TypeScript holds the content model together. Keystatic gives the team a way to edit pages. The chatbot lives in a separate Next.js app on Vercel, and it only answers from Truss House docs.

## HTML-first site

I made the public housing content plain semantic HTML, so visitors and crawlers can read it without booting an app shell first.

Astro renders those pages as HTML by default, which means search engines, answer engines, and people all get the same readable content with no client-side state in the way. Astro's content collections also check the frontmatter before a page ships, so I'm not hoping loose runtime data behaves at request time.

## Typed content + CMS

The content model is typed, so missing fields, broken links, and half-filled project data fail before they reach production instead of after.

Keystatic handles the editing side without me building a custom CMS. The rule was simple: the team can update the site, and TypeScript keeps the project and page data predictable. Keystatic fit because it keeps content Git-backed and editable while holding onto the structure the build depends on.

## Customer-facing RAG chatbot

The chatbot is its own Next.js app on Vercel, kept separate from the marketing site so the public pages stay light. The widget lazy-loads, so it adds nothing to the first page load.

I built it around retrieval rather than open generation. If it answers a product question, that answer has to come from documentation Truss House controls.

## SEO/AEO + delivery

Search visibility here comes from the basics: crawlable HTML, stable URLs, direct headings, readable copy, and per-page metadata generated from the typed content.

I treated the FAQ answers as real content too, since the Schema.org FAQPage format hands crawlers a clean question and answer to pull.

## Outcome

Truss House ended up with a clearer marketing site, safer content updates, and a chatbot that answers product questions from their own docs without slowing the first page load.

## FAQ

### What did Yushi Cui build for Truss House?

I built the production Truss House website as a typed Astro site with semantic HTML, per-page metadata, static delivery, and AI-assisted workflows around housing content.
I also built the customer-facing chatbot as a separate Next.js app on Vercel, using semantic search and embeddings over Truss House product documentation.

### What technology stack did the Truss House project use?

The project used Astro, TypeScript, Tailwind CSS, Keystatic, and a separate Next.js chatbot on Vercel with semantic search and embeddings.

### How was the Truss House site optimized for search and answer engines?

The site uses crawlable HTML, direct page copy, structured content, per-page metadata, and FAQ answers that search and answer engines can read.
