const SITE_URL = "https://yushi91.com";

export interface PageMeta {
  slug: string;
  title: string;
  description?: string;
}

export interface HeadMetadata {
  canonical: string;
  og: {
    title: string;
    url: string;
    type: string;
    description?: string;
  };
  twitter: {
    card: string;
    title: string;
  };
  jsonLd: string | null;
}

export function buildHeadMetadata(page: PageMeta): HeadMetadata {
  const canonical = SITE_URL + page.slug;
  const description = page.description;

  const isHome = page.slug === "/";

  const jsonLd = isHome
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Yushi Cui",
        url: SITE_URL,
        jobTitle: "AI-Native Full Stack Engineer",
        sameAs: [
          "https://github.com/realYushi",
          "https://www.linkedin.com/in/yushi-cui/",
          "https://blog.yushi91.com",
        ],
      })
    : null;

  return {
    canonical,
    og: {
      title: page.title,
      url: canonical,
      type: "website",
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
    },
    jsonLd,
  };
}
