import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const pagePath = join(process.cwd(), "dist/index.html");

function readPage() {
  return readFileSync(pagePath, "utf8");
}

describe("Contact band", () => {
  beforeAll(() => {
    execFileSync("npx", ["astro", "build"], {
      cwd: process.cwd(),
      stdio: "pipe",
      env: { ...process.env, NO_COLOR: "1" },
    });
  }, 60_000);

  it("closes the page with a dark-teal band distinct from the white canvas", () => {
    const html = readPage();

    // The band uses the reserved dark-band palette token, not the white canvas.
    expect(html).toContain("bg-dark-band");
    // It is the closing landmark of the page.
    expect(html).toMatch(/<footer[\s\S]*bg-dark-band/);
  });

  it("offers direct contact channels: email, GitHub, LinkedIn, and blog", () => {
    const html = readPage();

    expect(html).toContain("mailto:realYushi@gmail.com");
    expect(html).toContain('href="/about/"');
    expect(html).toContain('href="/contact/"');
    expect(html).toContain("https://github.com/realYushi");
    expect(html).toContain("https://www.linkedin.com/in/yushi-cui/");
    expect(html).toContain("https://blog.yushi91.com");
  });

  it("links privacy and terms from the footer trust navigation", () => {
    const html = readPage();

    expect(html).toContain('aria-label="Trust pages"');
    expect(html).toContain('href="/privacy/"');
    expect(html).toContain('href="/terms/"');
  });

  it("posts the form to Web3Forms client-side with no backend of our own", () => {
    const html = readPage();

    // Static client-side POST straight to Web3Forms — no server round-trip we own.
    expect(html).toContain('action="https://api.web3forms.com/submit"');
    expect(html).toMatch(/<form[\s\S]*method="POST"/i);
    // Public access key routes submissions to the configured inbox.
    expect(html).toContain('value="3158397c-c2b2-4b0d-86b7-fe441f3f17c1"');
    // Sender fields.
    expect(html).toContain('name="email"');
    expect(html).toContain('name="message"');
  });

  it("enables Web3Forms honeypot spam protection", () => {
    const html = readPage();

    // Web3Forms treats a filled `botcheck` field as a bot and silently drops it.
    expect(html).toContain('name="botcheck"');
  });
});
