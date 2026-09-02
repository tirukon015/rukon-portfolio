import type { Metadata } from "next";
import { BlogIndex } from "@/components/sections/blog-index";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/content/site";
import { sortedPosts } from "@/content/posts";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  openGraphFor,
  PERSON_ID,
  twitterFor,
  WEBSITE_ID,
} from "@/lib/seo";

const description =
  "Notes on production and operations systems, IT systems, AI applications and web development, written from real project work rather than from tutorials.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: openGraphFor({ title: "Blog", description, url: "/blog" }),
  twitter: twitterFor("Blog", description),
};

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
];

export default function BlogPage() {
  const posts = sortedPosts();

  const schema = graph(
    {
      "@type": "Blog",
      "@id": absoluteUrl("/blog"),
      url: absoluteUrl("/blog"),
      name: `${site.name} Blog`,
      description,
      inLanguage: "en-MY",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: absoluteUrl(`/blog/${p.slug}`),
        datePublished: p.date,
        dateModified: p.updated ?? p.date,
        author: { "@id": PERSON_ID },
      })),
    },
    breadcrumbSchema(crumbs)
  );

  return (
    <>
      <JsonLd data={schema} />
      <BlogIndex crumbs={crumbs} description={description} />
    </>
  );
}
