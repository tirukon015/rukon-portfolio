import type { PostCategory } from "@/content/posts";

/**
 * Category metadata.
 *
 * Categories were previously a bare string union used only as a client-side
 * filter. They now also back `/blog/category/[slug]`, so each one needs a URL
 * slug and copy of its own. The union in posts.ts stays the source of truth for
 * which categories exist; this file describes them.
 *
 * Adding a category means adding it to `PostCategory` and adding an entry here.
 * A category with no posts is skipped when the routes are generated, so the
 * taxonomy can grow ahead of the content without producing empty pages.
 */
export type CategoryMeta = {
  name: PostCategory;
  slug: string;
  /** Used as the page h1 and in breadcrumbs. */
  title: string;
  /** Page description and category meta description. */
  description: string;
  /** Which project, if any, is the authority behind this category. */
  anchorProject?: string;
};

export const categoryMeta: CategoryMeta[] = [
  {
    name: "Operations",
    slug: "operations",
    title: "Operations",
    description:
      "Production and operations systems: modelling a physical process in software, and what happens when the model and the floor disagree.",
    anchorProject: "rpoms",
  },
  {
    name: "IT Systems",
    slug: "it-systems",
    title: "IT Systems",
    description:
      "IT systems work as it actually runs day to day: supporting, maintaining and building the internal systems a business depends on.",
    anchorProject: "rpoms",
  },
  {
    name: "Software Engineering",
    slug: "software-engineering",
    title: "Software Engineering",
    description:
      "Building and maintaining software that has to survive real, daily use: data models, access control, admin interfaces and the work that comes after launch.",
    anchorProject: "rpoms",
  },
  {
    name: "Business Automation",
    slug: "business-automation",
    title: "Business Automation",
    description:
      "Turning manual, repetitive business processes into software, and knowing which ones are worth it.",
    anchorProject: "rpoms",
  },
  {
    name: "Web Development",
    slug: "web-development",
    title: "Web Development",
    description:
      "Front-end and full-stack web work: taking a design to a production build, and the decisions in between.",
    anchorProject: "erth",
  },
  {
    name: "UI/UX",
    slug: "ui-ux",
    title: "UI/UX",
    description:
      "Interface and experience decisions, with an emphasis on internal tools, software people are required to use rather than choose to.",
    anchorProject: "rpoms",
  },
];

export function getCategoryMeta(name: PostCategory): CategoryMeta | undefined {
  return categoryMeta.find((c) => c.name === name);
}

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  return categoryMeta.find((c) => c.slug === slug);
}

export function categorySlug(name: PostCategory): string {
  return getCategoryMeta(name)?.slug ?? "";
}
