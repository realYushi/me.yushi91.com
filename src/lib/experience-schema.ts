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
