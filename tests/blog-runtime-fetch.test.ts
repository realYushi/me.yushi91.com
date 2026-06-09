import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const root = process.cwd();
const dist = (p: string) => join(root, "dist", p);

describe("Runtime fetch for blog preview updates", () => {
  beforeAll(() => {
    execFileSync("npx", ["astro", "build"], {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, NO_COLOR: "1" },
    });
  }, 60_000);

  it("includes client-side script to fetch fresh blog posts", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Should have a script tag that fetches the RSS feed
    expect(html).toContain("fetch(");
    expect(html).toContain("blog.yushi91.com/index.xml");
  });

  it("defers and bounds the runtime refresh so it does not compete with LCP", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    expect(html).toContain("requestIdleCallback");
    expect(html).toContain("timeoutMs:2500");
    expect(html).toContain("AbortController");
  });

  it("script handles fetch failure gracefully", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Should have error handling
    expect(html).toMatch(/catch|error/i);
  });

  it("script updates the DOM with fresh posts", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Should have DOM manipulation to update blog posts
    expect(html).toMatch(/querySelector|getElementById|innerHTML/i);
  });
});
