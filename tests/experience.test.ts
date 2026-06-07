import { describe, expect, it } from "vitest";
import {
  experienceSchema,
  formatExperienceDate,
  formatExperienceTitle,
  type Experience,
} from "../src/lib/experience";

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

describe("experience formatters", () => {
  const role = goodRole as Extract<Experience, { kind: "role" }>;
  const education = goodEducation as Extract<Experience, { kind: "education" }>;

  it("renders 'Present' when a role has not ended", () => {
    // An open-ended role must read as current, not as a blank end date.
    expect(formatExperienceDate({ ...role, end: null })).toBe("2025–Present");
  });

  it("renders the closed date range when a role has ended", () => {
    expect(formatExperienceDate({ ...role, start: "2023", end: "2024" })).toBe("2023–2024");
  });

  it("uses the education's own dates string and never its (absent) start/end", () => {
    // Education has no start/end in the union; the formatter must read `dates`.
    expect(formatExperienceDate(education)).toBe("2020–2023");
  });

  it("titles a role as 'role · org'", () => {
    expect(formatExperienceTitle(role)).toBe(
      "AI-Native Product Engineer & Full-Stack Dev · GrowLab Technologies",
    );
  });

  it("titles education as 'degree · institution'", () => {
    expect(formatExperienceTitle(education)).toBe("B.CompSci · AUT");
  });
});
