import { describe, expect, it } from "vitest";
import { decodeHTMLEntitiesRegex, formatExcerpt, formatDate } from "../src/lib/utils";

describe("decodeHTMLEntitiesRegex", () => {
  it("decodes basic HTML entities", () => {
    expect(decodeHTMLEntitiesRegex("&lt;p&gt;Hello&lt;/p&gt;")).toBe("<p>Hello</p>");
    expect(decodeHTMLEntitiesRegex("&amp;")).toBe("&");
    expect(decodeHTMLEntitiesRegex("&quot;")).toBe('"');
    expect(decodeHTMLEntitiesRegex("&apos;")).toBe("'");
  });

  it("decodes curly quote entities", () => {
    expect(decodeHTMLEntitiesRegex("&ldquo;Hello&rdquo;")).toBe('"Hello"');
    expect(decodeHTMLEntitiesRegex("&lsquo;Hi&rsquo;")).toBe("'Hi'");
    expect(decodeHTMLEntitiesRegex("&rsquo;")).toBe("'");
  });

  it("decodes nbsp", () => {
    expect(decodeHTMLEntitiesRegex("Hello&nbsp;World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(decodeHTMLEntitiesRegex("")).toBe("");
  });

  it("handles text without entities", () => {
    expect(decodeHTMLEntitiesRegex("Plain text")).toBe("Plain text");
  });
});

describe("formatExcerpt", () => {
  it("strips HTML tags", () => {
    expect(formatExcerpt("<p>Hello <strong>world</strong></p>", 50)).toBe("Hello world");
  });

  it("truncates to max length and adds ellipsis", () => {
    const longText = "a".repeat(200);
    const result = formatExcerpt(longText, 50);
    expect(result.length).toBe(51); // 50 + "…" (1 char, not 3)
    expect(result).toContain("…");
  });

  it("does not add ellipsis when content fits", () => {
    const result = formatExcerpt("<p>Hello world</p>", 50);
    expect(result).toBe("Hello world");
    expect(result).not.toContain("…");
  });

  it("handles empty string", () => {
    expect(formatExcerpt("", 100)).toBe("");
  });

  it("handles multiple HTML tags", () => {
    const html = "<h1>Title</h1><p>Paragraph with <a href='#'>link</a></p>";
    const result = formatExcerpt(html, 100);
    expect(result).toBe("TitleParagraph with link");
    expect(result).not.toContain("<");
  });
});

describe("formatDate", () => {
  it("formats date as absolute string", () => {
    const date = new Date("2026-05-28T10:00:00Z");
    const result = formatDate(date);
    expect(result).toMatch(/May.*28.*2026/);
  });

  it("handles different dates", () => {
    const date1 = new Date("2026-01-15");
    const date2 = new Date("2026-12-31");
    expect(formatDate(date1)).toContain("January");
    expect(formatDate(date2)).toContain("December");
  });
});
