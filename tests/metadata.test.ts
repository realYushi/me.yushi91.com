import { describe, it, expect } from "vitest";
import { SITE_URL, buildHeadMetadata, buildProjectJsonLd } from "../src/lib/metadata";

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
    expect(meta.canonical).toBe(SITE_URL + "/projects/truss-house/");
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

  it("allows article Open Graph type for case-study pages", () => {
    const meta = buildHeadMetadata({
      slug: "/projects/truss-house",
      title: "Truss House - Yushi Cui",
      ogType: "article",
    });

    expect(meta.og.type).toBe("article");
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
    expect(ld.jobTitle).toBe("Full-Stack Product Engineer");
    expect(ld.worksFor.name).toBe("GrowLab Technologies");
    expect(ld.alumniOf.name).toBe("Auckland University of Technology");
  });

  it("does not produce Person JSON-LD on non-homepage slugs", () => {
    const meta = buildHeadMetadata({
      slug: "/projects/truss-house",
      title: "Truss House",
    });
    expect(meta.jsonLd).toBeNull();
  });

  it("adds WebSite, ProfilePage, and FAQPage JSON-LD on the homepage", () => {
    const meta = buildHeadMetadata({
      slug: "/",
      title: "Home",
      description: "Yushi Cui is a full-stack product engineer in Auckland, NZ.",
    });

    const schemas = meta.additionalJsonLd.map((jsonLd) => JSON.parse(jsonLd));

    expect(schemas).toHaveLength(3);
    expect(schemas[0]["@type"]).toBe("WebSite");
    expect(schemas[0].author["@id"]).toBe(`${SITE_URL}/#person`);
    expect(schemas[1]["@type"]).toBe("ProfilePage");
    expect(schemas[1].mainEntity["@id"]).toBe(`${SITE_URL}/#person`);
    expect(schemas[2]["@type"]).toBe("FAQPage");
    expect(schemas[2].mainEntity[0].name).toBe("Who is Yushi Cui?");
  });

  it("builds project CreativeWork and FAQPage JSON-LD", () => {
    const ld = buildProjectJsonLd({
      slug: "/projects/truss-house",
      title: "Truss House",
      description: "Typed content platform for housing information.",
      role: "Full-stack engineer",
      stack: ["Astro", "TypeScript", "RAG"],
      year: 2026,
      link: "https://www.trusshouse.org/",
      faq: [
        {
          question: "What did Yushi Cui build for Truss House?",
          answer: "Yushi Cui built a crawlable Astro website with typed content and AI-assisted workflows.",
        },
      ],
    });

    const graph = ld["@graph"] as Array<Record<string, any>>;
    const creativeWork = graph.find((item) => item["@type"] === "CreativeWork");
    const faq = graph.find((item) => item["@type"] === "FAQPage");

    expect(creativeWork?.url).toBe(`${SITE_URL}/projects/truss-house/`);
    expect(creativeWork?.keywords).toContain("Full-stack engineer");
    expect(faq?.mainEntity[0].name).toBe("What did Yushi Cui build for Truss House?");
  });

  it("fails if Person JSON-LD stops identifying Yushi Cui", () => {
    const meta = buildHeadMetadata({ slug: "/", title: "Home" });
    const ld = parseJsonLd(meta.jsonLd);

    expect(ld.name).toContain("Yushi Cui");
  });
});
