import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getPost, getRelatedPosts, postExcerpt, posts } from "@/content/posts";
import { getCategoryMeta } from "@/content/categories";
import { getProject } from "@/content/projects";
import { estimateReadingTime } from "@/lib/reading-time";
import { site } from "@/content/site";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  openGraphFor,
  PERSON_ID,
  twitterFor,
  WEBSITE_ID,
} from "@/lib/seo";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.description;

  return {
    title,
    description,
    alternates: { canonical: post.canonical ?? `/blog/${post.slug}` },
    authors: [{ name: site.name, url: `https://${site.domain}` }],
    openGraph: openGraphFor({
      title,
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      section: post.category,
      tags: post.tags,
    }),
    twitter: twitterFor(title, description),
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const category = getCategoryMeta(post.category);
  const projectsBehind = (post.relatedProjects ?? [])
    .map((s) => getProject(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    ...(category ? [{ name: category.title, href: `/blog/category/${category.slug}` }] : []),
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  const wordCount = post.sections
    .flatMap((s) => s.body)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  const schema = graph(
    {
      "@type": "BlogPosting",
      "@id": absoluteUrl(`/blog/${post.slug}`),
      mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${post.slug}`) },
      url: absoluteUrl(`/blog/${post.slug}`),
      headline: post.title,
      description: post.seoDescription ?? post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      articleSection: post.category,
      keywords: post.tags.join(", "),
      wordCount,
      inLanguage: "en-MY",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
      ...(projectsBehind.length
        ? {
            about: projectsBehind.map((p) => ({
              "@type": "CreativeWork",
              name: p.fullName,
              url: absoluteUrl(`/work/${p.slug}`),
            })),
          }
        : {}),
    },
    breadcrumbSchema(crumbs)
  );

  return (
    <article className="py-20">
      <JsonLd data={schema} />

      <Container className="max-w-3xl">
        <Breadcrumbs items={crumbs} />

        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-faint">
            {category ? (
              <Link
                href={`/blog/category/${category.slug}`}
                className="font-mono uppercase tracking-wide text-accent transition-colors hover:text-accent-strong"
              >
                {post.category}
              </Link>
            ) : (
              <span className="font-mono uppercase tracking-wide text-accent">{post.category}</span>
            )}
            <span aria-hidden="true">&middot;</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-GB", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span aria-hidden="true">&middot;</span>
            <span>{estimateReadingTime(post.sections)}</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-text-muted">{post.description}</p>
          <p className="mt-4 text-sm text-text-faint">By {site.name}</p>
        </Reveal>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-strong px-3 py-1 font-mono text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-10">
          {post.sections.map((section, i) => (
            <Reveal key={section.heading} delayMs={Math.min(i * 30, 150)}>
              <h2 className="text-xl font-semibold text-text">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-4">
                {section.body.map((p) => (
                  <p key={p} className="text-base leading-relaxed text-text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        {projectsBehind.length > 0 ? (
          <Reveal className="mt-14 rounded-2xl border border-border-strong bg-bg-elevated p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
              The work behind this
            </h2>
            <ul className="mt-4 flex flex-col gap-4">
              {projectsBehind.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/work/${p.slug}`}
                    className="group inline-flex flex-col gap-1 text-left"
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong transition-colors group-hover:text-accent">
                      {p.name} case study <ArrowUpRight size={13} />
                    </span>
                    <span className="text-sm leading-relaxed text-text-muted">{p.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}

        {post.related && post.related.length > 0 ? (
          <Reveal className="mt-6 rounded-2xl border border-border bg-bg-elevated p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
              Related
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {post.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm text-accent-strong transition-colors hover:text-accent"
                  >
                    {link.label} <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </Container>

      {related.length > 0 ? (
        <Container className="mt-20 max-w-3xl border-t border-border pt-14">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
            Keep reading
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex items-center justify-between gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0"
              >
                <div>
                  <h3 className="text-base font-medium text-text">{p.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{postExcerpt(p)}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-text-faint transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
