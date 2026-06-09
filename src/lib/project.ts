import { z } from "zod";

const projectLinkSchema = z.object({
  label: z.string().trim().min(1),
  url: z.url(),
});

const projectFaqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  role: z.string().trim().min(1),
  stack: z.array(z.string().trim().min(1)).min(1),
  year: z.number().int().min(2000).max(2100),
  links: z.array(projectLinkSchema).min(1),
  flagship: z.boolean(),
  ordering: z.number().int().min(1),
  faq: z.array(projectFaqSchema).optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectLink = z.infer<typeof projectLinkSchema>;

// The primary link is the first link by convention; `links` is non-empty by schema.
// Naming it here keeps every call site from re-deciding what `links[0]` means.
export function primaryLink(project: Project): ProjectLink {
  return project.links[0];
}
