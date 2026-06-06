import { z } from "zod";

const projectLinkSchema = z.object({
  label: z.string().trim().min(1),
  url: z.url(),
});

export const projectSchema = z
  .object({
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    role: z.string().trim().min(1),
    stack: z.array(z.string().trim().min(1)).min(1),
    year: z.number().int().min(2000).max(2100),
    links: z.array(projectLinkSchema).min(1),
    flagship: z.boolean(),
    ordering: z.number().int().min(1),
    body: z.string().trim().min(1).optional(),
  })
  .superRefine((project, context) => {
    if (project.flagship && !project.body) {
      context.addIssue({
        code: "custom",
        path: ["body"],
        message: "Flagship projects require a body.",
      });
    }
  });

export type Project = z.infer<typeof projectSchema>;
