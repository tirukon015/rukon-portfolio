import type { PostCategory } from "@/content/posts";

/**
 * Category metadata.
 *
 * Six clusters, each with a URL slug and copy of its own, because each one
 * backs `/blog/category/[slug]`. The union in posts/types.ts stays the source
 * of truth for which categories exist; this file describes them.
 *
 * The earlier six categories (Operations, IT Systems, Software Engineering,
 * Business Automation, Web Development, UI/UX) were folded into these on
 * 2026-09-24. Their old URLs redirect permanently; see next.config.ts.
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
    name: "Building Real Systems",
    slug: "building-real-systems",
    title: "Building Real Systems",
    description:
      "Operational software for a physical process: modelling the floor in software, the data model, imports, paperwork and reporting, and what happens when the model and the floor disagree.",
    anchorProject: "rpoms",
  },
  {
    name: "Full-Stack Development",
    slug: "full-stack-development",
    title: "Full-Stack Development",
    description:
      "Next.js, TypeScript, Python, PostgreSQL and the deployment path: how the pieces are wired, what broke in production, and what the fix taught.",
    anchorProject: "rpoms",
  },
  {
    name: "AI & Automation",
    slug: "ai-and-automation",
    title: "AI & Automation",
    description:
      "LLM and vision features that behave, and the plainer automation that removes retyping: schemas, fallbacks, deterministic rules, staged imports.",
    anchorProject: "researchforge",
  },
  {
    name: "UI/UX & Product",
    slug: "ui-ux-and-product",
    title: "UI/UX & Product",
    description:
      "From a Figma prototype to a production build without losing the intent, and interfaces for internal tools that people are required to use rather than choose.",
    anchorProject: "erth",
  },
  {
    name: "Developer Journey",
    slug: "developer-journey",
    title: "Developer Journey",
    description:
      "What the work is actually like: roles, learning, and the parts of a technical career a job title leaves out.",
  },
  {
    name: "Malaysia & Cyberjaya",
    slug: "malaysia-and-cyberjaya",
    title: "Malaysia & Cyberjaya",
    description:
      "Building and running software from Cyberjaya: time zones, connectivity, local context, and the development environment behind the work.",
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
