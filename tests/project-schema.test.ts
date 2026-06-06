import { describe, expect, it } from "vitest";
import { projectSchema } from "../src/lib/project-schema";

const goodProject = {
  title: "Truss House",
  summary: "A client-facing AI-native housing platform.",
  role: "Full-stack engineer",
  stack: ["Astro", "TypeScript", "RAG"],
  year: 2025,
  links: [{ label: "Live", url: "https://www.trusshouse.org/" }],
  flagship: true,
  ordering: 1,
  body: "Longer case-study copy for the flagship project.",
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

  it("rejects a flagship project with no body", () => {
    const { body, ...projectWithoutBody } = goodProject;

    const result = projectSchema.safeParse(projectWithoutBody);

    expect(result.success).toBe(false);
  });

  it("allows a non-flagship selected project without body copy", () => {
    const { body, ...projectWithoutBody } = goodProject;

    const result = projectSchema.safeParse({
      ...projectWithoutBody,
      flagship: false,
      title: "echo",
      ordering: 2,
    });

    expect(result.success).toBe(true);
  });

  it("rejects malformed project links", () => {
    const result = projectSchema.safeParse({
      ...goodProject,
      links: [{ label: "Live", url: "not-a-url" }],
    });

    expect(result.success).toBe(false);
  });
});
