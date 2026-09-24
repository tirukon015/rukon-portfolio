import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { PostList } from "@/components/blog/post-list";
import { getPostsByCategory, publishedAt, usedCategories } from "@/content/posts";
import { categoryMeta, getCategoryBySlug } from "@/content/categories";
import { getProject } from "@/content/projects";
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

  const title = `${category.title}: Writing`;
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
        datePublished: publishedAt(p.date),
        dateModified: publishedAt(p.updated ?? p.date),
        author: { "@id": PERSON_ID },
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
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Topic</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            {category.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">{category.description}</p>
          {anchor ? (
            <p className="mt-4 text-sm text-text-muted">
              Most of this comes out of{" "}
              <Link href={`/work/${anchor.slug}`} className="text-accent-strong transition-colors hover:text-accent">
                {anchor.name}
              </Link>
              .
            </p>
          ) : null}
        </Reveal>

        <div className="mt-12">
          <PostList posts={categoryPosts} />
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
