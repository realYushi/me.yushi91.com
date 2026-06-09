import { z } from "zod";

const projectLinkSchema = z.object({
  label: z.string().trim().min(1),
  url: z.url(),
});

const projectFaqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const projectCitationSchema = z.object({
  label: z.string().trim().min(1),
  url: z.url(),
});

const projectMetricSchema = z.object({
  value: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  role: z.string().trim().min(1),
  stack: z.array(z.string().trim().min(1)).min(1),
  year: z.number().int().min(2000).max(2100),
  links: z.array(projectLinkSchema).min(1),
  // Optional card thumbnail. Value is a public path base without size/extension
  // (e.g. "/projects/truss-house"); the card builds `${image}-640.webp` and
  // `${image}-960.webp` for a responsive srcset. Only set it for live projects
  // with a real screenshot.
  image: z.string().trim().min(1).optional(),
  flagship: z.boolean(),
  ordering: z.number().int().min(1),
  faq: z.array(projectFaqSchema).optional(),
  citations: z.array(projectCitationSchema).optional(),
  metrics: z.array(projectMetricSchema).optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectLink = z.infer<typeof projectLinkSchema>;

// The primary link is the first link by convention; `links` is non-empty by schema.
// Naming it here keeps every call site from re-deciding what `links[0]` means.
export function primaryLink(project: Project): ProjectLink {
  return project.links[0];
}
