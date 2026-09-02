import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getPostsByCategory, postExcerpt, usedCategories } from "@/content/posts";
import { categoryMeta, getCategoryBySlug } from "@/content/categories";
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
} from "@/lib/seo";

/**
 * Only categories that actually have posts get a page.
 *
 * That is what lets the taxonomy grow ahead of the content: a category can be
 * declared before anything is written for it without producing an empty,
 * thin page for a crawler to find.
 */
export function generateStaticParams() {
  const used = new Set(usedCategories());
  return categoryMeta.filter((c) => used.has(c.name)).map((c) => ({ slug: c.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category.title} Writing`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/blog/category/${category.slug}` },
    openGraph: openGraphFor({
      title,
      description: category.description,
      url: `/blog/category/${category.slug}`,
    }),
    twitter: twitterFor(title, category.description),
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryPosts = getPostsByCategory(category.name);
  if (categoryPosts.length === 0) notFound();

  const anchor = category.anchorProject ? getProject(category.anchorProject) : undefined;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: category.title, href: `/blog/category/${category.slug}` },
  ];

  const schema = graph(
    {
      "@type": "CollectionPage",
      "@id": absoluteUrl(`/blog/category/${category.slug}`),
      url: absoluteUrl(`/blog/category/${category.slug}`),
      name: `${category.title} | ${site.name}`,
      description: category.description,
      inLanguage: "en-MY",
      about: { "@id": PERSON_ID },
      hasPart: categoryPosts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: absoluteUrl(`/blog/${p.slug}`),
        datePublished: p.date,
      })),
    },
    breadcrumbSchema(crumbs)
  );

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs items={crumbs} />

        <Reveal className="mt-8 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Category</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            {category.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">{category.description}</p>
          {anchor ? (
            <p className="mt-4 text-sm text-text-muted">
              Most of this comes out of{" "}
              <Link
                href={`/work/${anchor.slug}`}
                className="text-accent-strong transition-colors hover:text-accent"
              >
                {anchor.name}
              </Link>
              .
            </p>
          ) : null}
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryPosts.map((post, i) => (
            <Reveal key={post.slug} delayMs={Math.min(i * 40, 200)}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border p-6 transition-colors hover:border-border-strong"
              >
                <div className="flex items-center gap-3 text-xs text-text-faint">
                  <span className="font-mono uppercase tracking-wide text-accent">
                    {post.category}
                  </span>
                  <span aria-hidden="true">&middot;</span>
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-text">{post.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                  {postExcerpt(post)}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-text-faint">
                  <span>{estimateReadingTime(post.sections)}</span>
                  <span className="inline-flex items-center gap-1.5 text-accent-strong">
                    Read
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent-strong"
          >
            All writing <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </div>
  );
}
