import { describe, it, expect } from "vitest";
import { projectSchema, primaryLink } from "../src/lib/project";

describe("primaryLink", () => {
  it("returns the first link by convention", () => {
    const project = projectSchema.parse({
      title: "Test Project",
      summary: "A test project",
      role: "Lead",
      stack: ["TypeScript"],
      year: 2024,
      links: [
        { label: "Live", url: "https://example.com" },
        { label: "Source", url: "https://github.com/test" },
      ],
      flagship: false,
      ordering: 1,
    });

    const result = primaryLink(project);

    expect(result.label).toBe("Live");
    expect(result.url).toBe("https://example.com");
  });

  it("works with a single link", () => {
    const project = projectSchema.parse({
      title: "Single Link Project",
      summary: "A project with one link",
      role: "Author",
      stack: ["Python"],
      year: 2024,
      links: [{ label: "Demo", url: "https://demo.example.com" }],
      flagship: true,
      ordering: 2,
    });

    const result = primaryLink(project);

    expect(result.label).toBe("Demo");
    expect(result.url).toBe("https://demo.example.com");
  });

  it("establishes the architectural contract: first link is primary", () => {
    // This test documents the convention that the primary link is always
    // the first link in the array. If this convention changes, this test
    // should be updated to reflect the new contract.
    const project = projectSchema.parse({
      title: "Multi-Link Project",
      summary: "A project with many links",
      role: "Contributor",
      stack: ["Go", "Docker"],
      year: 2024,
      links: [
        { label: "Production", url: "https://prod.example.com" },
        { label: "Staging", url: "https://staging.example.com" },
        { label: "Source", url: "https://github.com/test" },
      ],
      flagship: false,
      ordering: 3,
    });

    const result = primaryLink(project);

    // The first link (Production) is considered primary
    expect(result.label).toBe("Production");
    expect(result.url).toBe("https://prod.example.com");
  });

  it("requires at least one link by schema validation", () => {
    // This test documents that the schema enforces non-empty links array,
    // so primaryLink will never receive an empty array at runtime.
    const result = projectSchema.safeParse({
      title: "Invalid Project",
      summary: "A project with no links",
      role: "Author",
      stack: ["JavaScript"],
      year: 2024,
      links: [],
      flagship: false,
      ordering: 4,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(">=1");
    }
  });
});
