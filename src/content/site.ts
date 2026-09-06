export const site = {
  name: "Touhidul Islam Rukon",
  shortName: "Rukon",
  initials: "TIR",
  role: "IT Systems & Operations Lead · Web Developer · Software Specialist",
  location: "Cyberjaya, Selangor, Malaysia",
  email: "tirukon015@gmail.com",
  emailHref: "mailto:tirukon015@gmail.com",
  phoneDisplay: "+60 11-1784 2250",
  whatsapp: "https://wa.me/601117842250",
  /** Display form, used in the OG image wordmark. Not a URL. */
  domain: "rukon.dev",
  /**
   * The host production actually serves from.
   *
   * The apex 308-redirects to www, so building canonicals, og:url and the
   * sitemap from the apex pointed every one of them at a URL that redirects.
   * Canonical metadata has to name the URL that answers 200, not the one that
   * bounces, so every absolute URL is built from this.
   */
  canonicalHost: "www.rukon.dev",
  /** Used for og:locale and the Person schema. */
  locale: "en_MY",
  statement:
    "I work across IT systems, operations, web and software: understanding an operational problem, designing the system for it, building and deploying it, then supporting and improving it once people depend on it daily. RPOMS, an ERP-style operational platform running a live router-refurbishment line, is the clearest example.",
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
