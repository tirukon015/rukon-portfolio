import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PostList } from "@/components/blog/post-list";
import { sortedPosts } from "@/content/posts";
import { categoryMeta } from "@/content/categories";
import type { Crumb } from "@/lib/seo";

/**
 * The blog index.
 *
 * Server component: nothing here needs JavaScript. The category row is a set
 * of real links to the category pages rather than an in-page filter, which is
 * what makes every view of the library a crawlable URL with its own metadata,
 * and what keeps the article bodies out of the client bundle.
 */
export function BlogIndex({ crumbs, description }: { crumbs: Crumb[]; description: string }) {
  const posts = sortedPosts();
  const browsable = categoryMeta
    .map((c) => ({ ...c, count: posts.filter((p) => p.category === c.name).length }))
    .filter((c) => c.count > 0);

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <Container>
        <Breadcrumbs items={crumbs} />

        <span className="mt-8 block font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Blog
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Notes from building real systems.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">{description}</p>

        <nav aria-label="Browse by topic" className="mt-10">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {browsable.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/blog/category/${cat.slug}`}
                  className="inline-flex items-baseline gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
                >
                  {cat.title}
                  <span className="font-mono text-[11px] text-text-faint">{cat.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10">
          <PostList posts={posts} />
        </div>

        <p className="mt-10 text-sm text-text-faint">
          Also available as an{" "}
          <a href="/feed.xml" className="text-text-muted underline decoration-border-strong underline-offset-4 hover:text-text">
            RSS feed
          </a>
          .
        </p>
      </Container>
    </div>
  );
}
