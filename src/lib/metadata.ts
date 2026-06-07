export const SITE_URL = "https://yushi91.com";

const HOME_SLUG = "/";
const PERSON_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yushi Cui",
  url: SITE_URL,
  jobTitle: "Full-Stack Product Engineer",
  sameAs: [
    "https://github.com/realYushi",
    "https://www.linkedin.com/in/yushi-cui/",
    "https://blog.yushi91.com",
  ],
});

export interface PageMeta {
  slug: string;
  title: string;
  description?: string;
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
  };
  twitter: {
    card: string;
    title: string;
    description?: string;
  };
  jsonLd: string | null;
}

export function buildHeadMetadata(page: PageMeta): HeadMetadata {
  const canonical = SITE_URL + page.slug;
  const description = page.description;
  const jsonLd = page.slug === HOME_SLUG ? PERSON_JSON_LD : null;

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
      type: "website",
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description,
    },
    jsonLd,
  };
}
