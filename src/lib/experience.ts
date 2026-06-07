import { z } from "zod";

const oneLineText = z.string().trim().min(1).refine((value) => !/[\r\n]/.test(value), {
  message: "Expected one-line text.",
});

const roleExperienceSchema = z.object({
  kind: z.literal("role"),
  role: oneLineText,
  org: oneLineText,
  start: oneLineText,
  end: oneLineText.nullable(),
  summary: oneLineText,
  ordering: z.number().int().min(1),
});

const educationExperienceSchema = z.object({
  kind: z.literal("education"),
  degree: oneLineText,
  institution: oneLineText,
  dates: oneLineText,
  summary: oneLineText,
  ordering: z.number().int().min(1),
});

export const experienceSchema = z.discriminatedUnion("kind", [
  roleExperienceSchema,
  educationExperienceSchema,
]);

export type Experience = z.infer<typeof experienceSchema>;

/**
 * Format experience date for display
 *
 * For roles: returns "Start - End" with "Present" for current roles.
 * For education: returns the freeform dates string as-is.
 *
 * This function encapsulates the date display convention, keeping
 * the formatting logic in one place. Callers don't need to know
 * about the different date structures between role and education.
 */
export function formatExperienceDate(experience: Experience): string {
  if (experience.kind === "education") {
    return experience.dates;
  }

  return `${experience.start} - ${experience.end ?? "Present"}`;
}

/**
 * Format experience title for display
 *
 * For roles: returns "Role · Organization"
 * For education: returns "Degree · Institution"
 *
 * This function encapsulates the title convention and separator,
 * ensuring consistency across all displays of experience data.
 */
export function formatExperienceTitle(experience: Experience): string {
  if (experience.kind === "education") {
    return `${experience.degree} · ${experience.institution}`;
  }

  return `${experience.role} at ${experience.org}`;
}

/**
 * Calculate the duration of a role in years
 *
 * Returns null for education entries or if start date can't be parsed.
 * For current roles, calculates from start to now.
 */
export function formatExperienceDuration(experience: Experience): string | null {
  if (experience.kind !== "role") {
    return null;
  }

  const start = new Date(experience.start);
  if (isNaN(start.getTime())) {
    return null;
  }

  const end = experience.end ? new Date(experience.end) : new Date();
  const years = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));

  if (years < 1) {
    return "< 1 year";
  }
  if (years === 1) {
    return "1 year";
  }
  return `${years} years`;
}

/**
 * Get the current (active) role from an experience list
 *
 * By convention, the current role is the role entry with end === null.
 * Returns null if no current role exists or if the array is empty.
 */
export function getCurrentRole(experiences: Experience[]): Experience | null {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    experiences.find(
      (entry) => entry.kind === "role" && entry.end === null
    ) || null
  );
}
