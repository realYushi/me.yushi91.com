export const SITE_URL = "https://yushi91.com";

const HOME_SLUG = "/";
const DEFAULT_HOME_DESCRIPTION = "Yushi Cui is a full-stack product engineer in Auckland, NZ, building AI-assisted products, typed content systems, and fast Astro/TypeScript apps.";
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const HOME_FAQ = [
  {
    question: "Who is Yushi Cui?",
    answer: "Yushi Cui is a full-stack product engineer based in Auckland, New Zealand, building AI-assisted products, typed content systems, and fast web applications.",
  },
  {
    question: "What does Yushi Cui build?",
    answer: "Yushi builds end-to-end web products, AI-assisted workflows, Astro and TypeScript applications, React interfaces, and retrieval-augmented generation systems.",
  },
  {
    question: "What technologies does Yushi Cui work with?",
    answer: "Yushi works with Astro, TypeScript, React, Node.js, Keystatic, static site delivery, AI agents, and retrieval-augmented generation workflows.",
  },
  {
    question: "Where is Yushi Cui based?",
    answer: "Yushi Cui is based in Auckland, New Zealand, and works on product engineering, AI-native workflows, and full-stack web applications.",
  },
] as const;

const PROFILE_LINKS = [
  "https://github.com/realYushi",
  "https://www.linkedin.com/in/yushi-cui/",
  "https://blog.yushi91.com",
];

interface ProjectJsonLdInput {
  slug: string;
  title: string;
  description: string;
  role: string;
  stack: string[];
  year: number;
  link?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  citations?: Array<{
    label: string;
    url: string;
  }>;
  metrics?: Array<{
    value: string;
    label: string;
  }>;
}

export interface PageMeta {
  slug: string;
  title: string;
  description?: string;
  ogType?: "website" | "article";
  jsonLd?: unknown;
}

export interface HeadMetadata {
  canonical: string;
  favicons: {
    svg: string;
    shortcut: string;
    appleTouchIcon: string;
  };
  og: {
    title: string;
    url: string;
    type: string;
    description?: string;
    image: string;
  };
  twitter: {
    card: string;
    title: string;
    description?: string;
    image: string;
  };
  jsonLd: string | null;
  additionalJsonLd: string[];
}

function absoluteUrl(slug: string): string {
  const url = new URL(slug, SITE_URL);

  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname = `${url.pathname}/`;
  }

  return url.toString();
}

function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Yushi Cui",
    url: SITE_URL,
    image: `${SITE_URL}/avatar-photo-800.png`,
    jobTitle: "Full-Stack Product Engineer",
    worksFor: {
      "@type": "Organization",
      name: "GrowLab Technologies",
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Auckland University of Technology",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Auckland",
      addressCountry: "NZ",
    },
    knowsLanguage: ["English", "Chinese"],
    knowsAbout: [
      "Full-stack product engineering",
      "AI-assisted software development",
      "Astro static websites",
      "TypeScript",
      "React",
      "Retrieval-augmented generation",
      "Spec-driven development",
    ],
    sameAs: PROFILE_LINKS,
  };
}

export function buildHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    ...personSchema(),
  };
}

function buildHomeAdditionalJsonLd(description: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Yushi Cui",
      url: SITE_URL,
      inLanguage: "en-NZ",
      description,
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile-page`,
      url: `${SITE_URL}/`,
      name: "Yushi Cui - Full-Stack Product Engineer in Auckland, NZ",
      description,
      inLanguage: "en-NZ",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      url: `${SITE_URL}/`,
      inLanguage: "en-NZ",
      mainEntity: HOME_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];
}

export function buildProjectJsonLd(project: ProjectJsonLdInput) {
  const url = absoluteUrl(project.slug);
  const graph: unknown[] = [
    personSchema(),
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Yushi Cui",
      url: SITE_URL,
      inLanguage: "en-NZ",
      author: { "@id": PERSON_ID },
    },
    {
      "@type": "CreativeWork",
      "@id": `${url}#case-study`,
      url,
      name: project.title,
      headline: `${project.title} case study`,
      description: project.description,
      inLanguage: "en-NZ",
      dateCreated: String(project.year),
      author: { "@id": PERSON_ID },
      creator: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
      about: project.stack.map((name) => ({
        "@type": "Thing",
        name,
      })),
      keywords: [project.role, ...project.stack].join(", "),
      ...(project.citations && project.citations.length > 0
        ? {
            citation: project.citations.map((item) => ({
              "@type": "CreativeWork",
              name: item.label,
              url: item.url,
            })),
          }
        : {}),
      ...(project.metrics && project.metrics.length > 0
        ? {
            abstract: project.metrics.map((item) => `${item.value} ${item.label}`).join("; "),
          }
        : {}),
      ...(project.link ? { sameAs: project.link } : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Selected work",
          item: `${SITE_URL}/#projects`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: project.title,
          item: url,
        },
      ],
    },
  ];

  if (project.faq && project.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      inLanguage: "en-NZ",
      mainEntity: project.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function buildHeadMetadata(page: PageMeta): HeadMetadata {
  const canonical = absoluteUrl(page.slug);
  const description = page.description;
  const isHome = page.slug === HOME_SLUG;
  const jsonLd = page.jsonLd
    ? JSON.stringify(page.jsonLd)
    : isHome
      ? JSON.stringify(buildHomeJsonLd())
      : null;
  const additionalJsonLd = isHome
    ? buildHomeAdditionalJsonLd(description ?? DEFAULT_HOME_DESCRIPTION).map((schema) => JSON.stringify(schema))
    : [];
  // Absolute URL: OG/Twitter crawlers do not resolve relative paths.
  const image = SITE_URL + "/og-cover.png";

  return {
    canonical,
    favicons: {
      svg: "/favicon.svg",
      shortcut: "/favicon.svg",
      appleTouchIcon: "/apple-touch-icon.svg",
    },
    og: {
      title: page.title,
      url: canonical,
      type: page.ogType ?? "website",
      description,
      image,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description,
      image,
    },
    jsonLd,
    additionalJsonLd,
  };
}
