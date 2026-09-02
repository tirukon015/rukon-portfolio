export const site = {
  name: "Touhidul Islam Rukon",
  shortName: "Rukon",
  initials: "TIR",
  role: "Software Developer, Operations and AI Systems",
  location: "Cyberjaya, Selangor, Malaysia",
  email: "tirukon015@gmail.com",
  emailHref: "mailto:tirukon015@gmail.com",
  phoneDisplay: "+60 11-1784 2250",
  whatsapp: "https://wa.me/601117842250",
  domain: "rukon.dev",
  /** Used for og:locale and the Person schema. */
  locale: "en_MY",
  statement:
    "I build the systems a business actually runs on. A production-operations platform for a live router-refurbishment line, an AI document-analysis application deployed on its own domain, and requirement-driven SEO and content work on a production website, built end to end, and maintained after launch.",
  links: {
    github: "https://github.com/tirukon015",
    linkedin: "https://linkedin.com/in/tirukon015",
    twitter: "https://x.com/myself_rukon",
  },
  resumeHref: "/documents/Touhidul-Islam-Rukon-Resume.pdf",
  resumeFileName: "Touhidul-Islam-Rukon-Resume.pdf",
  /**
   * Single source of truth for the blog link. Today it's an in-app route;
   * swapping to an external subdomain (e.g. https://blog.rukon.dev) later
   * only requires changing this one value. Nothing else references a URL.
   */
  blogHref: "/blog",
  /** Project index. Same reasoning as blogHref. */
  workHref: "/work",
} as const;

export const nav = [
  { label: "Work", href: "/#work", sectionId: "work" },
  { label: "Experience", href: "/#experience", sectionId: "experience" },
  { label: "Skills", href: "/#stack", sectionId: "stack" },
  { label: "About", href: "/#about", sectionId: "about" },
  { label: "Blog", href: site.blogHref, sectionId: null },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
] as const;

/**
 * Extra footer destinations that aren't part of the primary nav.
 *
 * The header nav is anchor-driven (it tracks the active homepage section), so
 * adding a real route to it would break that behaviour for one item. These
 * live in the footer instead, which is a plain link list.
 */
export const footerLinks = [
  { label: "All Projects", href: site.workHref },
] as const;
