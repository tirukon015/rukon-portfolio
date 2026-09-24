import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { postExcerpt, type BlogPost } from "@/content/posts";
import { categorySlug } from "@/content/categories";
import { estimateReadingTime } from "@/lib/reading-time";
import { Reveal } from "@/components/ui/reveal";

export function formatPostDate(iso: string, month: "short" | "long" = "short") {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Articles as rows.
 *
 * The same list serves the blog index, the category pages and the project
 * cross-links, so a post looks the same wherever it is listed. Category is a
 * real link to the category page, not a filter, so every route is crawlable.
 */
export function PostList({ posts, headingLevel = "h2" }: { posts: BlogPost[]; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ol className="divide-y divide-border border-t border-border">
      {posts.map((post, i) => (
        <Reveal key={post.slug} as="li" delayMs={Math.min(i * 40, 200)} className="grid grid-cols-1 gap-2 py-7 md:grid-cols-12 md:gap-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint md:col-span-3 md:pt-1">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden="true"> · </span>
            <Link
              href={`/blog/category/${categorySlug(post.category)}`}
              className="text-accent transition-colors hover:text-accent-strong"
            >
              {post.category}
            </Link>
          </p>
          <div className="md:col-span-8">
            <Heading className="text-xl font-semibold tracking-tight text-text">
              <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-accent-strong">
                {post.title}
              </Link>
            </Heading>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">{postExcerpt(post)}</p>
            <p className="mt-3 text-xs text-text-faint">{estimateReadingTime(post.sections)}</p>
          </div>
          <span aria-hidden="true" className="hidden items-start justify-end pt-1 md:col-span-1 md:flex">
            <ArrowRight size={16} className="text-text-faint" />
          </span>
        </Reveal>
      ))}
    </ol>
  );
}
