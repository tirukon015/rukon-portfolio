export const site = {
  name: "Touhidul Islam Rukon",
  shortName: "Rukon",
  initials: "TIR",
  role: "IT Systems & Operations Lead · Web Developer · Software Specialist",
  location: "Cyberjaya, Selangor, Malaysia",
  email: "tirukon015@gmail.com",
  emailHref: "mailto:tirukon015@gmail.com",
  /*
   * The phone number used to live here. It was rendered nowhere, but `site` is
   * imported by client components, so it shipped in the JavaScript bundle and
   * was readable by anyone who looked. That made it public while the CV
   * containing the same number sat behind the access gate. Removed rather than
   * left as a contradiction; it belongs in the CV, which is now gated.
   */
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
    "I work across IT systems, operations, web and software: understanding an operational problem, designing the system for it, building and deploying it, then supporting and improving it once people depend on it daily. RPOMS, the operations system running a live router-refurbishment line, is the clearest example; alongside it sit a live AI research assistant, a browser-to-printer label engine and native iOS work.",
  /** Search and share description: the statement, cut to snippet length. */
  metaDescription:
    "Operations systems, full-stack web apps, AI and native iOS work by Touhidul Islam Rukon in Cyberjaya. Flagship: RPOMS, the system running a live router-refurbishment line.",
  /**
   * The hero headline. A statement about the work rather than a greeting: the
   * name is already in the header, the title tag and the About section.
   */
  headline: "I build the systems a business runs on.",
  /**
   * Verifiable facts under the hero copy. Each one is backed elsewhere on the
   * site (experience.ts, the RPOMS and ResearchForge status tables, about.ts).
   */
  now: [
    { label: "Role", value: "IT Systems & Operations Lead, Blue Bee Technologies", href: null },
    { label: "Shipped", value: "RPOMS, an operational system in daily use", href: "/work/rpoms" },
    { label: "Live", value: "ResearchForge, an AI research assistant", href: "/work/researchforge" },
    { label: "Status", value: "Open to opportunities", href: "/#contact" },
  ] as readonly { label: string; value: string; href: string | null }[],
  /** The GitHub login the contribution calendar is fetched for. */
  githubLogin: "tirukon015",
  links: {
    github: "https://github.com/tirukon015",
    linkedin: "https://linkedin.com/in/tirukon015",
    twitter: "https://x.com/myself_rukon",
  },
  /**
   * The CV is no longer a static file link.
   *
   * It sits behind an access page: the document itself lives outside `public/`
   * and is served only by an API route that checks a server-issued grant, so
   * there is no URL anywhere that hands it over without going through the form.
   */
  cvHref: "/cv",
  /**
   * Single source of truth for the blog link. Today it's an in-app route;
   * swapping to an external subdomain (e.g. https://blog.rukon.dev) later
   * only requires changing this one value. Nothing else references a URL.
   */
  blogHref: "/blog",
  /** Project index. Same reasoning as blogHref. */
  workHref: "/work",
} as const;

/**
 * Primary navigation.
 *
 * `sectionId` drives the active state on the homepage, where the link is an
 * anchor. `match` drives it on every other route, by pathname prefix, so
 * "Work" lights up on /work/rpoms and "Writing" on /blog/anything.
 */
export type NavItem = {
  label: string;
  href: string;
  sectionId: string | null;
  match: string | null;
};

export const nav: readonly NavItem[] = [
  { label: "Work", href: "/#work", sectionId: "work", match: site.workHref },
  { label: "About", href: "/#about", sectionId: "about", match: null },
  { label: "Blog", href: site.blogHref, sectionId: null, match: site.blogHref },
  { label: "Resume", href: site.cvHref, sectionId: null, match: site.cvHref },
  { label: "Contact", href: "/#contact", sectionId: "contact", match: null },
];

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
