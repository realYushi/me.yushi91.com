import { describe, expect, it } from "vitest";
import { formatExcerpt } from "../src/lib/blog";

describe("formatExcerpt", () => {
  it("strips HTML tags from description", () => {
    const html = "<p>Hello <strong>world</strong></p>";
    const result = formatExcerpt(html, 100);
    expect(result).toBe("Hello world");
  });

  it("truncates to approximately 150 characters by default", () => {
    const longText = "<p>" + "a".repeat(200) + "</p>";
    const result = formatExcerpt(longText, 150);
    expect(result.length).toBeLessThanOrEqual(154); // 150 + "…" (3 chars) + margin
  });

  it("appends ellipsis when content is truncated", () => {
    const longText = "<p>" + "a".repeat(200) + "</p>";
    const result = formatExcerpt(longText, 50);
    expect(result).toContain("…");
  });

  it("does not append ellipsis when content fits", () => {
    const shortText = "<p>Hello world</p>";
    const result = formatExcerpt(shortText, 100);
    expect(result).not.toContain("…");
  });

  it("handles empty descriptions gracefully", () => {
    const result = formatExcerpt("", 100);
    expect(result).toBe("");
  });

  it("handles descriptions shorter than limit", () => {
    const shortText = "<p>Hello</p>";
    const result = formatExcerpt(shortText, 100);
    expect(result).toBe("Hello");
  });

  it("handles multiple HTML tags", () => {
    const html = "<h1>Title</h1><p>Paragraph <a href='#'>with link</a></p>";
    const result = formatExcerpt(html, 100);
    expect(result).toBe("TitleParagraph with link");
  });
});
