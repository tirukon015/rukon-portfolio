import type { Block, BlogPost, PostCategory, PostSection } from "./types";

export type {
  Block,
  BlogPost,
  CalloutBlock,
  CodeBlock,
  FlowBlock,
  ImageBlock,
  ListBlock,
  PostCategory,
  PostContentType,
  PostSection,
  RelatedLink,
  SearchIntent,
  TableBlock,
} from "./types";

/*
 * One file per article, under ./articles. Add a new article by creating a
 * file there and importing it below; order here does not matter, because
 * every listing sorts by date.
 */
import { post as productionManagementSystem } from "./articles/what-is-a-production-management-system";
import { post as manualTrackingProblems } from "./articles/common-problems-manual-production-tracking";
import { post as adminPanels } from "./articles/how-admin-panels-help-manage-operational-data";
import { post as manualToDigital } from "./articles/from-manual-workflow-to-digital-workflow";
import { post as physicalProcess } from "./articles/why-developers-should-understand-the-physical-process";
import { post as maintenance } from "./articles/why-system-maintenance-matters-after-deployment";
import { post as figmaFirst } from "./articles/designing-a-website-in-figma-before-development";
import { post as figmaToProduction } from "./articles/from-figma-design-to-production-website";
import { post as figmaComponents } from "./articles/translating-figma-components-into-reusable-code";
import { post as responsiveDesign } from "./articles/designing-for-desktop-and-mobile-before-development";
import { post as itSystemsRole } from "./articles/what-an-it-systems-role-actually-involves";
import { post as repetitiveWork } from "./articles/replacing-repetitive-manual-work-with-software";
import { post as internalUx } from "./articles/why-internal-software-needs-good-ux";
import { post as reporting } from "./articles/reporting-from-operational-data";
import { post as prototypeRebuild } from "./articles/rebuilding-a-design-prototype-as-a-production-website";
import { post as staticVerification } from "./articles/verifying-a-static-site-you-built-by-hand";
import { post as imagePayload } from "./articles/cutting-a-page-image-payload-from-12mb-to-under-3mb";
import { post as llmGroundedness } from "./articles/making-an-llm-admit-the-paper-does-not-say";
import { post as providerFallback } from "./articles/when-not-to-fall-back-to-another-ai-provider";
import { post as rlsInert } from "./articles/every-policy-was-correct-and-every-policy-was-inert";
import { post as githubHeatmap } from "./articles/live-github-contribution-heatmap-in-nextjs";
import { post as cvGrant } from "./articles/gating-a-cv-download-behind-a-server-signed-grant";
import { post as storageBackends } from "./articles/one-storage-interface-three-backends";
import { post as stagedCsv } from "./articles/staged-csv-import-for-operational-data";
import { post as businessDay } from "./articles/the-business-day-is-not-the-server-day";
import { post as webBluetooth } from "./articles/printing-labels-from-the-browser-over-web-bluetooth";
import { post as visionObserves } from "./articles/a-vision-model-that-only-observes";
import { post as cyberjayaEnvironment } from "./articles/building-software-in-cyberjaya-the-development-environment";

export const posts: BlogPost[] = [
  productionManagementSystem,
  manualTrackingProblems,
  adminPanels,
  manualToDigital,
  physicalProcess,
  maintenance,
  figmaFirst,
  figmaToProduction,
  figmaComponents,
  responsiveDesign,
  itSystemsRole,
  repetitiveWork,
  internalUx,
  reporting,
  prototypeRebuild,
  staticVerification,
  imagePayload,
  llmGroundedness,
  providerFallback,
  rlsInert,
  githubHeatmap,
  cvGrant,
  storageBackends,
  stagedCsv,
  businessDay,
  webBluetooth,
  visionObserves,
  cyberjayaEnvironment,
];

export const categories: PostCategory[] = [
  "Building Real Systems",
  "Full-Stack Development",
  "AI & Automation",
  "UI/UX & Product",
  "Developer Journey",
  "Malaysia & Cyberjaya",
];

/* ------------------------------------------------------------------------ */
/* Lookups                                                                   */
/* ------------------------------------------------------------------------ */

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: PostCategory) {
  return sortedPosts().filter((p) => p.category === category);
}

/** Categories that actually have at least one post. */
export function usedCategories(): PostCategory[] {
  return categories.filter((c) => posts.some((p) => p.category === c));
}

/**
 * Related reading for an article.
 *
 * Hand-picked `relatedPosts` come first, because a curated pair is always
 * better than a category match. Same-category posts fill any remaining slots,
 * which is what keeps this useful as the library grows past the point where
 * "same category" means anything on its own.
 */
export function getRelatedPosts(post: BlogPost, limit = 3) {
  const picked = (post.relatedPosts ?? [])
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p) && p!.slug !== post.slug);

  const seen = new Set(picked.map((p) => p.slug));
  const sameCategory = sortedPosts().filter(
    (p) => p.slug !== post.slug && p.category === post.category && !seen.has(p.slug)
  );

  return [...picked, ...sameCategory].slice(0, limit);
}

/**
 * Articles that draw on a given project.
 *
 * Reads the structured `relatedProjects` field, and falls back to the older
 * hand-written `related` links so no existing relationship is lost.
 */
export function getPostsForProject(projectSlug: string) {
  const href = `/work/${projectSlug}`;
  return sortedPosts().filter(
    (p) =>
      p.relatedProjects?.includes(projectSlug) ||
      p.related?.some((link) => link.href === href)
  );
}

/** Newest first. */
export function sortedPosts() {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Falls back to `description` so every card and meta tag has copy. */
export function postExcerpt(post: BlogPost) {
  return post.excerpt ?? post.description;
}

/* ------------------------------------------------------------------------ */
/* Text                                                                      */
/* ------------------------------------------------------------------------ */

/** The readable text of one block, for word counts and feeds. */
export function blockText(block: string | Block): string {
  if (typeof block === "string") return block;
  switch (block.type) {
    case "list":
      return block.items.join(" ");
    case "code":
      return block.caption ?? "";
    case "callout":
      return block.text;
    case "flow":
      return block.steps.join(" ");
    case "image":
      return block.caption ?? block.alt;
    case "table":
      return [block.head.join(" "), ...block.rows.map((r) => r.join(" "))].join(" ");
  }
}

export function sectionsText(sections: PostSection[]): string {
  return sections
    .flatMap((s) => [s.heading, ...s.body.map(blockText)])
    .join(" ");
}

export function postWordCount(post: BlogPost): number {
  return sectionsText(post.sections).split(/\s+/).filter(Boolean).length;
}

/**
 * A date-only field as an ISO 8601 instant with the time zone the site
 * publishes in. Google asks for the zone on datePublished and dateModified;
 * without one, the crawler's own zone is assumed.
 */
export function publishedAt(date: string): string {
  return `${date}T00:00:00+08:00`;
}

/** A URL-safe id for a section heading, so a table of contents can link to it. */
export function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
