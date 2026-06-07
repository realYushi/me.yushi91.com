import { describe, expect, it } from "vitest";
import { primaryLink, projectSchema, type Project } from "../src/lib/project";

const goodProject = {
  title: "Truss House",
  summary: "A client-facing AI-native housing platform.",
  role: "Full-stack engineer",
  stack: ["Astro", "TypeScript", "RAG"],
  year: 2025,
  links: [{ label: "Live", url: "https://www.trusshouse.org/" }],
  flagship: true,
  ordering: 1,
};

describe("projectSchema", () => {
  it("accepts representative selected project content", () => {
    expect(projectSchema.safeParse(goodProject).success).toBe(true);
  });

  it("rejects a project with no stack", () => {
    const { stack, ...projectWithoutStack } = goodProject;

    const result = projectSchema.safeParse(projectWithoutStack);

    expect(result.success).toBe(false);
  });

  it("rejects malformed project links", () => {
    const result = projectSchema.safeParse({
      ...goodProject,
      links: [{ label: "Live", url: "not-a-url" }],
    });

    expect(result.success).toBe(false);
  });

  it("treats the first link as the primary link", () => {
    // Call sites render this link's label verbatim, so the convention lives in one place.
    const project: Project = {
      ...goodProject,
      links: [
        { label: "GitHub", url: "https://github.com/realYushi/echo" },
        { label: "Live", url: "https://echo.example/" },
      ],
    };

    expect(primaryLink(project)).toEqual({
      label: "GitHub",
      url: "https://github.com/realYushi/echo",
    });
  });
});
