/**
 * The blog content model.
 *
 * A post is a list of sections, and a section body is a list of blocks. A
 * plain string is a paragraph; the other block types cover what engineering
 * writing actually needs (lists, code, a callout, a flow diagram, an image, a
 * table) without pulling in a Markdown or MDX pipeline. Paragraphs, list items
 * and callouts accept two inline forms: `[label](href)` for a link and
 * `` `code` `` for inline code. Nothing else is interpreted.
 */

export type PostCategory =
  | "Building Real Systems"
  | "Full-Stack Development"
  | "AI & Automation"
  | "UI/UX & Product"
  | "Developer Journey"
  | "Malaysia & Cyberjaya";

export type ListBlock = { type: "list"; items: string[]; ordered?: boolean };

export type CodeBlock = {
  type: "code";
  code: string;
  /** Display label only; nothing is syntax-highlighted. */
  lang?: string;
  caption?: string;
};

export type CalloutBlock = { type: "callout"; text: string; label?: string };

/**
 * A flow diagram drawn from real steps: a numbered sequence rendered as a
 * chain. Used for architecture and pipelines, and readable as a plain list by
 * anything that cannot see the layout.
 */
export type FlowBlock = { type: "flow"; steps: string[]; caption?: string };

export type ImageBlock = {
  type: "image";
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type TableBlock = {
  type: "table";
  head: string[];
  rows: string[][];
  caption?: string;
};

export type Block = ListBlock | CodeBlock | CalloutBlock | FlowBlock | ImageBlock | TableBlock;

export type PostSection = {
  heading: string;
  body: (string | Block)[];
};

export type RelatedLink = {
  label: string;
  href: string;
};

/** What kind of article this is. Drives structure, not styling. */
export type PostContentType =
  | "Experience-led"
  | "Case Study"
  | "Technical Guide"
  | "Problem/Solution"
  | "Comparison"
  | "Explainer"
  | "Industry Analysis"
  | "Career"
  | "Local/Malaysia"
  | "SEO/GEO"
  | "AI Engineering"
  | "Business Systems";

/** The query shape an article is written to answer. */
export type SearchIntent =
  | "informational"
  | "problem-aware"
  | "commercial-adjacent"
  | "navigational";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. Published in Malaysian time. */
  date: string;
  /** Set when an article is materially revised. Feeds dateModified. */
  updated?: string;
  category: PostCategory;
  tags: string[];
  sections: PostSection[];

  /** Hand-picked outbound links rendered in the article's Related panel. */
  related?: RelatedLink[];
  /** Project slugs this article draws its authority from. */
  relatedProjects?: string[];
  /** Post slugs worth reading alongside this one, beyond same-category matches. */
  relatedPosts?: string[];

  /** Defaults to `description` when unset. */
  excerpt?: string;
  /** Defaults to `title` when unset. */
  seoTitle?: string;
  /** Defaults to `description` when unset. */
  seoDescription?: string;
  /** Set only when an article must point somewhere other than its own URL. */
  canonical?: string;

  contentType?: PostContentType;
  searchIntent?: SearchIntent;
  /** Only set where an article has genuine local context. */
  location?: string;
};
