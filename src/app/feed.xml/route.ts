import { sortedPosts, postExcerpt, publishedAt } from "@/content/posts";
import { site } from "@/content/site";
import { absoluteUrl, BASE_URL } from "@/lib/seo";

/**
 * RSS 2.0 feed of the blog.
 *
 * Built from the same post list as every other view, at build time. Only
 * public, canonical article URLs appear; the description is the article's
 * excerpt, not its body.
 */
/** Built once at build time, like every other blog view. */
export const dynamic = "force-static";

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const posts = sortedPosts();
  const lastBuild = posts[0] ? new Date(publishedAt(posts[0].updated ?? posts[0].date)) : new Date();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(publishedAt(post.date)).toUTCString()}</pubDate>
      <category>${escape(post.category)}</category>
      <description>${escape(postExcerpt(post))}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)}: Writing</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${escape(
      "Notes on production and operations systems, full-stack development, AI applications and web development, written from real project work."
    )}</description>
    <language>en-my</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
