import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { posts, sortedPosts, usedCategories } from "@/content/posts";
import { categoryMeta } from "@/content/categories";
import { BASE_URL } from "@/lib/seo";

/**
 * The newest post date, used as the last-modified stamp for the pages whose
 * content is derived from the post list. Beats a build timestamp, which would
 * change on every deploy and tell a crawler nothing.
 */
function latestPostDate(): string {
  return sortedPosts()[0]?.date ?? new Date().toISOString().slice(0, 10);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = latestPostDate();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: latest, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/work`, lastModified: latest, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE_URL}/work/${p.slug}`,
    lastModified: latest,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const used = new Set(usedCategories());
  const categoryRoutes: MetadataRoute.Sitemap = categoryMeta
    .filter((c) => used.has(c.name))
    .map((c) => {
      const newest = sortedPosts().find((p) => p.category === c.name)?.date ?? latest;
      return {
        url: `${BASE_URL}/blog/category/${c.slug}`,
        lastModified: newest,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      };
    });

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updated ?? p.date,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...projectRoutes, ...categoryRoutes, ...postRoutes];
}
