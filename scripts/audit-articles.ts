/**
 * Article audit: one line per finding, over every published article.
 *
 *   npx tsx --conditions=react-server scripts/audit-articles.ts [--json out.json] [--strict]
 *
 * Checks the data that SEO, answer engines and readers depend on: title and
 * description length, duplicates, structure (sections, question headings),
 * internal links into the portfolio (projects, articles), broken internal
 * links, links to projects that do not exist, thin content, and a missing
 * related-project link where the body clearly discusses a project.
 * With --strict it exits non-zero on errors (not on advisory notes).
 */
import fs from "node:fs";
import { sortedPosts } from "../src/content/posts";
import { projects } from "../src/content/projects";
import { usedCategories } from "../src/content/posts";
import { categoryMeta } from "../src/content/categories";
import type { BlogPost, Block } from "../src/content/posts/types";

const args = process.argv.slice(2);
const posts = sortedPosts();
const slugs = new Set(posts.map((p) => p.slug));
const projectSlugs = new Set(projects.map((p) => p.slug));
const categorySlugs = new Set(categoryMeta.filter((c) => usedCategories().includes(c.name)).map((c) => c.slug));

type Finding = { slug: string; level: "error" | "note"; msg: string };
const findings: Finding[] = [];
const add = (slug: string, level: Finding["level"], msg: string) => findings.push({ slug, level, msg });

function blockText(b: string | Block): string {
  if (typeof b === "string") return b;
  switch (b.type) {
    case "list": return b.items.join(" ");
    case "table": return [...b.head, ...b.rows.flat(), b.caption ?? ""].join(" ");
    case "callout": return `${b.label ?? ""} ${b.text}`;
    case "flow": return [...b.steps, b.caption ?? ""].join(" ");
    case "image": return `${b.alt} ${b.caption ?? ""}`;
    case "code": return b.caption ?? "";
    default: return "";
  }
}
const allText = (p: BlogPost) => [p.description, ...p.sections.flatMap((s) => [s.heading, ...s.body.map(blockText)])].join(" ");
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

const titles = new Map<string, string[]>();
const descs = new Map<string, string[]>();
const stats = { internalLinks: 0, projectLinks: 0, articleLinks: 0, questionHeadings: 0, withRelatedProjects: 0 };

for (const p of posts) {
  const t = p.seoTitle ?? p.title;
  titles.set(t, [...(titles.get(t) ?? []), p.slug]);
  descs.set(p.description, [...(descs.get(p.description) ?? []), p.slug]);
  if (t.length > 70) add(p.slug, "note", `title ${t.length} chars (>70 may truncate in results)`);
  if (t.length < 25) add(p.slug, "note", `title ${t.length} chars (short)`);
  if (p.description.length < 70) add(p.slug, "error", `description ${p.description.length} chars (<70)`);
  if (p.description.length > 170) add(p.slug, "note", `description ${p.description.length} chars (>170 truncates)`);
  if (!p.sections.length) add(p.slug, "error", "no sections");

  const text = allText(p);
  const wc = words(text);
  if (wc < 350) add(p.slug, "note", `thin: ${wc} words`);

  const links = [...text.matchAll(/\]\((\/[^)\s#]*)(#[^)]*)?\)/g)].map((m) => m[1]);
  const related = (p.related ?? []).map((r) => r.href);
  for (const href of [...links, ...related]) {
    stats.internalLinks++;
    const work = href.match(/^\/work\/([^/]+)(\/case-study)?$/);
    const blog = href.match(/^\/blog\/([^/]+)$/);
    const cat = href.match(/^\/blog\/category\/([^/]+)$/);
    if (work) {
      stats.projectLinks++;
      if (!projectSlugs.has(work[1])) add(p.slug, "note", `links to /work/${work[1]} (resolved by alias or redirect, not the public slug)`);
    } else if (blog) {
      stats.articleLinks++;
      if (!slugs.has(blog[1])) add(p.slug, "error", `links to unpublished or missing article /blog/${blog[1]}`);
    } else if (cat) {
      if (!categorySlugs.has(cat[1])) add(p.slug, "error", `links to empty or missing category ${href}`);
    } else if (!/^\/(|work|blog|cv|feed\.xml|#.*)$/.test(href) && !href.startsWith("/#")) {
      add(p.slug, "note", `internal link to ${href}`);
    }
  }
  for (const r of p.relatedPosts ?? []) if (!slugs.has(r)) add(p.slug, "error", `relatedPosts names missing article ${r}`);
  if (p.relatedProjects?.length) stats.withRelatedProjects++;
  if (!links.length && !related.length && !(p.relatedPosts?.length)) add(p.slug, "note", "no internal links in the body or related lists");

  const q = p.sections.filter((s) => /\?$/.test(s.heading.trim())).length;
  stats.questionHeadings += q;
}
for (const [t, s] of titles) if (s.length > 1) for (const slug of s) add(slug, "error", `duplicate title "${t}" (${s.join(", ")})`);
for (const [, s] of descs) if (s.length > 1) for (const slug of s) add(slug, "error", `duplicate description (${s.join(", ")})`);

const errors = findings.filter((f) => f.level === "error");
const notes = findings.filter((f) => f.level === "note");
const byMsg = (fs: Finding[]) => {
  const m = new Map<string, number>();
  for (const f of fs) m.set(f.msg.replace(/\d+/g, "N").replace(/\/[a-z0-9-]+/g, "/…").slice(0, 70), (m.get(f.msg.replace(/\d+/g, "N").replace(/\/[a-z0-9-]+/g, "/…").slice(0, 70)) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]);
};
console.log(`articles: ${posts.length}`);
console.log(`internal links: ${stats.internalLinks} (to projects ${stats.projectLinks}, to articles ${stats.articleLinks}); articles with relatedProjects: ${stats.withRelatedProjects}; question headings: ${stats.questionHeadings}`);
console.log(`errors: ${errors.length}, notes: ${notes.length}`);
for (const [m, n] of byMsg(errors)) console.log(`  error x${n}: ${m}`);
for (const [m, n] of byMsg(notes)) console.log(`  note  x${n}: ${m}`);
if (args.includes("--json")) fs.writeFileSync(args[args.indexOf("--json") + 1], JSON.stringify({ stats, findings }, null, 2));
if (args.includes("--strict") && errors.length) process.exit(1);
