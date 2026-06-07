import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const pagePath = join(process.cwd(), "dist/projects/truss-house/index.html");

function readPage() {
  return readFileSync(pagePath, "utf8");
}

describe("Truss House case-study page", () => {
  beforeAll(() => {
    execFileSync("npx", ["astro", "build"], {
      cwd: process.cwd(),
      stdio: "pipe",
      env: { ...process.env, NO_COLOR: "1" },
    });
  }, 60_000);

  it("renders the flagship project as a skim-first static page", () => {
    expect(existsSync(pagePath)).toBe(true);

    const html = readPage();

    expect(html).toContain("Client-facing housing platform rebuilt around typed content");
    expect(html).toContain("ROLE");
    expect(html).toContain("STACK");
    expect(html).toContain("YEAR");
    expect(html).toContain("LIVE ↗");
    expect(html).toContain("HTML-FIRST SITE");
  });

  it("links the landing-page Truss House row to the case study", () => {
    const html = readFileSync(join(process.cwd(), "dist/index.html"), "utf8");

    expect(html).toContain('href="/projects/truss-house"');
  });

  it("emits per-page canonical and Open Graph metadata", () => {
    const html = readPage();

    expect(html).toContain('rel="canonical" href="https://yushi91.com/projects/truss-house"');
    expect(html).toContain('property="og:url" content="https://yushi91.com/projects/truss-house"');
    expect(html).toContain('property="og:title" content="Truss House — Yushi Cui"');
    expect(html).toContain('property="og:description" content="Client-facing housing platform rebuilt around typed content, fast search, and AI-assisted workflows."');
  });
});
