# Astro (static) over the existing React SPA

We are rebuilding the profile site from a React SPA to Astro with fully static output. The redesign was framed as an "SEO rebuild," but that is **not** the real justification: the SEO-bearing content (technical writing) lives on a separate Hugo blog, so this site's only search job is to be the #1 result for the name "Yushi Cui" — a job any static HTML page does trivially. The real reasons we chose Astro: it ships HTML-first with effectively zero client JS (the current React SPA serves an empty shell until hydration), it's far simpler to maintain for a content-light personal site, and Yushi already knows Astro cold from the Truss House build.

## Considered Options

- **Stay on React SPA** — rejected: client-rendered, heavier, and its only advantage (rich interactivity) isn't needed here.
- **Astro static** — chosen.

## Consequences

The marginal-SEO framing is recorded deliberately so a future reader doesn't "re-justify" the rewrite on SEO grounds or expect ranking gains this site was never going to deliver.
