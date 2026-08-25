import type { Metadata } from "next";
import { BlogIndex } from "@/components/sections/blog-index";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `${site.name} Blog`,
  description:
    "Notes on IT systems, production and operations software, and web development, written from real project work.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <BlogIndex />;
}
