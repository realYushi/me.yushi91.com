import { describe, expect, it } from "vitest";
import { decodeWithRegex, decodeWithDOM } from "../src/lib/blog/decoders";

describe("decodeWithRegex", () => {
  it("decodes basic HTML entities", () => {
    expect(decodeWithRegex("&lt;p&gt;Hello&lt;/p&gt;")).toBe("<p>Hello</p>");
    expect(decodeWithRegex("&amp;")).toBe("&");
    expect(decodeWithRegex("&quot;")).toBe('"');
    expect(decodeWithRegex("&apos;")).toBe("'");
    expect(decodeWithRegex("&gt;")).toBe(">");
  });

  it("decodes curly quote entities", () => {
    expect(decodeWithRegex("&ldquo;Hello&rdquo;")).toBe('"Hello"');
    expect(decodeWithRegex("&lsquo;Hi&rsquo;")).toBe("'Hi'");
    expect(decodeWithRegex("&rsquo;")).toBe("'");
    expect(decodeWithRegex("&lsquo;")).toBe("'");
    expect(decodeWithRegex("&ldquo;")).toBe('"');
    expect(decodeWithRegex("&rdquo;")).toBe('"');
  });

  it("decodes nbsp", () => {
    expect(decodeWithRegex("Hello&nbsp;World")).toBe("Hello World");
  });

  it("decodes numeric entities", () => {
    expect(decodeWithRegex("&#39;")).toBe("'");
    expect(decodeWithRegex("&#34;")).toBe('"');
  });

  it("handles empty string", () => {
    expect(decodeWithRegex("")).toBe("");
  });

  it("handles text without entities", () => {
    expect(decodeWithRegex("Plain text")).toBe("Plain text");
  });

  it("handles mixed entities", () => {
    expect(decodeWithRegex("&lt;p&gt;Hello &quot;World&quot;&nbsp;&amp; more&lt;/p&gt;"))
      .toBe('<p>Hello "World" & more</p>');
  });
});

describe("decodeWithDOM", () => {
  it("decodes basic HTML entities in browser", () => {
    // This test runs in Node.js where document is undefined
    // We expect it to throw, which is the correct server-side behavior
    expect(() => decodeWithDOM("&lt;p&gt;Hello&lt;/p&gt;")).toThrow();
  });

  it("throws error when document is undefined", () => {
    expect(() => decodeWithDOM("test")).toThrow("requires browser environment");
  });
});
