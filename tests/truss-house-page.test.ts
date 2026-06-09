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

    expect(html).toContain("Marketing site rebuild and customer-facing RAG chatbot");
    // Skim-first metadata labels (rendered uppercase via CSS, not literal caps).
    expect(html).toContain("Role</dt>");
    expect(html).toContain("Stack</dt>");
    expect(html).toContain("Year</dt>");
    expect(html).toContain("LIVE ↗");
    expect(html).toContain("HTML-first site");
    // Flagship case study leads with a real screenshot of the live site.
    expect(html).toContain("/projects/truss-house-1600.webp");
    expect(html).toContain("Source links");
    expect(html).toContain("Astro content collections documentation");
    expect(html).toContain("TypeScript documentation");
    expect(html).toContain("Tailwind CSS documentation");
    expect(html).toContain("Next.js documentation");
    expect(html).toContain("Vercel documentation");
    expect(html).toContain("Google Search Central structured data introduction");
    expect(html).toContain("I made the public housing content plain semantic HTML");
    expect(html).toContain("Customer-facing RAG chatbot");
    expect(html).toContain("semantic search and embeddings");
    expect(html).toContain("it adds nothing to the first page load");
  });

  it("links the landing-page Truss House row to the case study", () => {
    const html = readFileSync(join(process.cwd(), "dist/index.html"), "utf8");

    expect(html).toContain('href="/projects/truss-house/"');
  });

  it("emits per-page canonical and Open Graph metadata", () => {
    const html = readPage();

    expect(html).toContain('rel="canonical" href="https://yushi91.com/projects/truss-house/"');
    expect(html).toContain('property="og:url" content="https://yushi91.com/projects/truss-house/"');
    expect(html).toContain('property="og:title" content="Truss House - Yushi Cui"');
    expect(html).toContain('property="og:description" content="Marketing site rebuild and customer-facing RAG chatbot for a housing technology company."');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"citation"');
  });
});
