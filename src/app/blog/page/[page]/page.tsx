import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogIndex } from "@/components/sections/blog-index";
import { JsonLd } from "@/components/seo/json-ld";
import { blogPageCount, blogPageHref, getBlogPage } from "@/content/posts";
import { breadcrumbSchema, graph, openGraphFor, twitterFor } from "@/lib/seo";

/** Pages 2…n of the blog index; page 1 is `/blog`. Re-rendered hourly with the post schedule. */
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  return Array.from({ length: Math.max(0, blogPageCount() - 1) }, (_, i) => ({ page: String(i + 2) }));
}

function parse(raw: string) {
  return /^\d+$/.test(raw) ? Number(raw) : NaN;
}

const description =
  "Notes on production and operations systems, full-stack development, AI applications and web development, written from real project work in Cyberjaya rather than from tutorials.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = parse((await params).page);
  const data = getBlogPage(n);
  if (!data || n === 1) return {};
  const title = `Blog, page ${n} of ${data.totalPages}`;
  const desc = `Page ${n} of ${data.totalPages}. ${description}`;
  return {
    title,
    description: desc,
    alternates: { canonical: blogPageHref(n), types: { "application/rss+xml": "/feed.xml" } },
    openGraph: openGraphFor({ title, description: desc, url: blogPageHref(n) }),
    twitter: twitterFor(title, desc),
  };
}

export default async function BlogPageN({ params }: Props) {
  const n = parse((await params).page);
  if (n === 1) permanentRedirect("/blog");
  const data = getBlogPage(n);
  if (!data) notFound();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: `Page ${n}`, href: blogPageHref(n) },
  ];
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema(crumbs))} />
      <BlogIndex crumbs={crumbs} description={description} page={n} />
    </>
  );
}
