import { describe, it, expect } from "vitest";
import { SITE_URL, buildHeadMetadata } from "../src/lib/metadata";

function parseJsonLd(jsonLd: string | null) {
  if (jsonLd === null) {
    throw new Error("Expected JSON-LD metadata to be present");
  }

  return JSON.parse(jsonLd);
}

describe("buildHeadMetadata", () => {
  it("produces a canonical URL from the page slug", () => {
    const meta = buildHeadMetadata({ slug: "/", title: "Home" });
    expect(meta.canonical).toBe(SITE_URL + "/");
  });

  it("produces canonical for a sub-page", () => {
    const meta = buildHeadMetadata({
      slug: "/projects/truss-house",
      title: "Truss House",
    });
    expect(meta.canonical).toBe(SITE_URL + "/projects/truss-house");
  });

  it("includes Open Graph tags with title, url, and type", () => {
    const meta = buildHeadMetadata({
      slug: "/",
      title: "Yushi Cui - AI-Native Full Stack Engineer",
      description: "Personal site for Yushi Cui.",
    });
    expect(meta.og.title).toBe("Yushi Cui - AI-Native Full Stack Engineer");
    expect(meta.og.url).toBe(SITE_URL + "/");
    expect(meta.og.type).toBe("website");
    expect(meta.og.description).toBe("Personal site for Yushi Cui.");
  });

  it("includes Twitter card tags", () => {
    const meta = buildHeadMetadata({
      slug: "/",
      title: "Yushi Cui - AI-Native Full Stack Engineer",
      description: "Personal site for Yushi Cui.",
    });
    expect(meta.twitter.card).toBe("summary_large_image");
    expect(meta.twitter.title).toBe("Yushi Cui - AI-Native Full Stack Engineer");
    expect(meta.twitter.description).toBe("Personal site for Yushi Cui.");
  });

  it("includes favicon metadata", () => {
    const meta = buildHeadMetadata({ slug: "/", title: "Home" });

    expect(meta.favicons.svg).toBe("/favicon.svg");
    expect(meta.favicons.shortcut).toBe("/favicon.svg");
    expect(meta.favicons.appleTouchIcon).toBe("/apple-touch-icon.svg");
  });

  it("produces Person JSON-LD identifying Yushi Cui on the homepage", () => {
    const meta = buildHeadMetadata({ slug: "/", title: "Home" });
    const ld = parseJsonLd(meta.jsonLd);

    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe("Yushi Cui");
    expect(ld.url).toBe(SITE_URL);
    expect(ld.jobTitle).toBe("AI-Native Full Stack Engineer");
  });

  it("does not produce Person JSON-LD on non-homepage slugs", () => {
    const meta = buildHeadMetadata({
      slug: "/projects/truss-house",
      title: "Truss House",
    });
    expect(meta.jsonLd).toBeNull();
  });

  it("fails if Person JSON-LD stops identifying Yushi Cui", () => {
    const meta = buildHeadMetadata({ slug: "/", title: "Home" });
    const ld = parseJsonLd(meta.jsonLd);

    expect(ld.name).toContain("Yushi Cui");
  });
});
