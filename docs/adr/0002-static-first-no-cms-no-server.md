# Static-first: no CMS, no server runtime

This site builds to static HTML with no CMS and no server adapter, hosted on Cloudflare Pages. Content lives in Astro content collections (Markdown/YAML) edited directly by Yushi.

This is a **deliberate deviation from the most recent reference build**: Truss House (also Astro) runs server output on Vercel with Keystatic CMS. Those choices existed to serve a non-technical client team (CMS GUI) and a server-only admin route (chat widget) — stakeholders and constraints that **do not exist on a personal site with a single technical editor**. Adding either here would be complexity serving no one, and a server runtime would weaken the one thing this site must do well (ship pure static HTML fast).

## Consequences

The Web3Forms contact form is the one third-party dependency, chosen specifically because it needs no backend (client-side POST), preserving the static-first property.
