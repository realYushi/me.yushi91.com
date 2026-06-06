import { describe, expect, it } from "vitest";
import { experienceSchema } from "../src/lib/experience-schema";

const goodRole = {
  kind: "role",
  role: "AI-Native Product Engineer & Full-Stack Dev",
  org: "GrowLab Technologies",
  start: "2025",
  end: null,
  summary: "Building AI-native product workflows and full-stack tools.",
  ordering: 1,
};

const goodEducation = {
  kind: "education",
  degree: "B.CompSci",
  institution: "AUT",
  dates: "2020–2023",
  summary: "Bachelor of Computer and Information Sciences.",
  ordering: 4,
};

describe("experienceSchema", () => {
  it("accepts representative role content", () => {
    expect(experienceSchema.safeParse(goodRole).success).toBe(true);
  });

  it("accepts representative education content", () => {
    expect(experienceSchema.safeParse(goodEducation).success).toBe(true);
  });

  it("rejects a role with missing required fields", () => {
    const { org, ...roleWithoutOrg } = goodRole;

    const result = experienceSchema.safeParse(roleWithoutOrg);

    expect(result.success).toBe(false);
  });

  it("rejects malformed role dates", () => {
    const result = experienceSchema.safeParse({
      ...goodRole,
      start: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects education content without one-line display text", () => {
    const result = experienceSchema.safeParse({
      ...goodEducation,
      summary: "Bachelor degree.\nSecond line.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed education dates", () => {
    const result = experienceSchema.safeParse({
      ...goodEducation,
      dates: "",
    });

    expect(result.success).toBe(false);
  });
});
