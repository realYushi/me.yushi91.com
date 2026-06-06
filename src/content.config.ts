import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { projectSchema } from "./lib/project-schema";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: projectSchema,
});

export const collections = { projects };
