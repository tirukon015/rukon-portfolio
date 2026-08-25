export const site = {
  name: "Touhidul Islam Rukon",
  shortName: "Rukon",
  initials: "TIR",
  role: "Software Developer",
  location: "Cyberjaya, Selangor, Malaysia",
  email: "tirukon015@gmail.com",
  emailHref: "mailto:tirukon015@gmail.com",
  phoneDisplay: "+60 11-1784 2250",
  whatsapp: "https://wa.me/601117842250",
  domain: "rukon.dev",
  statement:
    "I work at the intersection of IT systems and real-world operations: designing and building the software, and understanding the physical processes it runs, from customer-facing websites to the internal tools that keep a real business running.",
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
} as const;

export const nav = [
  { label: "Work", href: "/#work", sectionId: "work" },
  { label: "Experience", href: "/#experience", sectionId: "experience" },
  { label: "Skills", href: "/#stack", sectionId: "stack" },
  { label: "About", href: "/#about", sectionId: "about" },
  { label: "Blog", href: site.blogHref, sectionId: null },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
] as const;
