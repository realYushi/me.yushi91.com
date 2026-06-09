import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const APEX = "https://yushi91.com";
const root = process.cwd();
const dist = (p: string) => join(root, "dist", p);

// Slice 6 (#7) deploys the static build to Cloudflare Pages on the apex, with
// me.yushi91.com 301-redirecting to it. The deploy + DNS + redirect rule are
// HITL (Cloudflare account / live DNS), but the build MUST be apex-correct
// before it ships — these tests guard that and the documented runbook so a
// regression (e.g. reverting the canonical host back to the me. subdomain)
// fails CI instead of silently breaking the LinkedIn "Featured" link.
describe("Deploy readiness (apex build correctness)", () => {
  beforeAll(() => {
    execFileSync("npx", ["astro", "build"], {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, NO_COLOR: "1" },
    });
  }, 60_000);

  it("configures the build for the apex domain, not the me. subdomain", () => {
    const config = readFileSync(join(root, "astro.config.mjs"), "utf8");
    expect(config).toContain(`site: "${APEX}"`);
    expect(config).not.toContain("me.yushi91.com");
  });

  it("emits a sitemap rooted at the apex so search engines index the canonical host", () => {
    expect(existsSync(dist("sitemap-index.xml"))).toBe(true);
    expect(existsSync(dist("sitemap.xml"))).toBe(true);
    const urls = readFileSync(dist("sitemap-0.xml"), "utf8");
    const sitemap = readFileSync(dist("sitemap.xml"), "utf8");
    expect(urls).toContain(`${APEX}/`);
    expect(sitemap).toContain(`${APEX}/sitemap-0.xml`);
    expect(urls).not.toContain("me.yushi91.com");
  });

  it("ships llms.txt and AI-safe crawl rules", () => {
    expect(existsSync(dist("llms.txt"))).toBe(true);

    const llms = readFileSync(dist("llms.txt"), "utf8");
    const robots = readFileSync(dist("robots.txt"), "utf8");

    expect(llms).toContain("Yushi Cui");
    expect(llms).toContain(`${APEX}/projects/truss-house/`);
    expect(robots).toContain("User-agent: GPTBot");
    expect(robots).toContain("User-agent: OAI-SearchBot");
    expect(robots).toContain("User-agent: PerplexityBot");
    expect(robots).toContain("User-agent: ClaudeBot");
    expect(robots).toContain(`${APEX}/llms.txt`);
  });

  it("serves a homepage canonical pointing at the apex", () => {
    const html = readFileSync(dist("index.html"), "utf8");
    expect(html).toContain(`<link rel="canonical" href="${APEX}/"`);
    expect(html).not.toContain("me.yushi91.com");
  });

  it("ships valid Person JSON-LD identifying Yushi Cui on the apex", () => {
    const html = readFileSync(dist("index.html"), "utf8");
    const match = html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
    );
    if (!match) throw new Error("Person JSON-LD missing from built homepage");

    const ld = JSON.parse(match[1]);
    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe("Yushi Cui");
    expect(ld.url).toBe(APEX);
  });

  it("documents the HITL deploy steps so the redirect and auto-deploy are not lost", () => {
    const runbook = join(root, "docs/deploy.md");
    expect(existsSync(runbook)).toBe(true);
    const doc = readFileSync(runbook, "utf8");

    // The cross-domain 301 is a Cloudflare Redirect Rule, NOT _redirects
    // (Pages _redirects matches path only, not host).
    expect(doc).toMatch(/me\.yushi91\.com/);
    expect(doc).toMatch(/301/);
    expect(doc).toMatch(/redirect rule/i);
    // Git-integration auto-deploy on the default branch.
    expect(doc).toMatch(/auto-deploy|git integration/i);
  });
});
