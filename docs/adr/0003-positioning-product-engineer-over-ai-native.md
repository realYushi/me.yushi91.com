# Positioning: "Full-Stack Product Engineer" over "AI-Native Full Stack Engineer"

We are reframing the site's canonical self-label from **"AI-Native Full Stack Engineer"** to **"Full-Stack Product Engineer"**. The earlier label (see ADR-0001, which leans on the AI-native-specialist framing) over-indexed on AI as Yushi's identity; his actual direction is product-focused full-stack work on a long-term founder track, with AI as the sharpest tool in the kit rather than the whole story. AI is now shown as *evidence in the projects*, not claimed in the headline.

## Considered Options

- **Keep "AI-Native Full Stack Engineer"** — sharp, on-trend, but narrows Yushi to an AI specialist and misrepresents where he's heading. Rejected.
- **Generic "Full-Stack Engineer"** — true but undifferentiated; CONTEXT.md explicitly warns against reading as a "generic full-stack dev." Rejected.
- **"Full-Stack Product Engineer"** — chosen. Product judgment + end-to-end ownership is a rarer, founder-adjacent signal for an early-career engineer, and keeps AI as proof rather than pitch.

## Consequences

The guardrail from the old positioning still holds: **not a generic full-stack dev** — the differentiator is product judgment and shipping whole products end to end. A corollary, surfaced during the grilling that produced this ADR: the craft signal for a product/founder-track engineer is a fast, polished, *restrained* site — which is why a "fancy mode" three.js/GSAP toggle was rejected rather than added (it would signal indecision, not taste, and regress the lookup-fast default this site exists to serve).

The structured-data `jobTitle` in `src/lib/metadata.ts` and its locking tests carry the old label and must be updated to match.
