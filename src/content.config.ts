import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { experienceSchema } from "./lib/experience-schema";
import { projectSchema } from "./lib/project-schema";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: projectSchema,
});

const experience = defineCollection({
  loader: glob({ base: "./src/content/experience", pattern: "**/*.{md,mdx}" }),
  schema: experienceSchema,
});

export const collections = { projects, experience };
