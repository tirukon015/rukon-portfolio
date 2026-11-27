import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PostList } from "@/components/blog/post-list";
import { BLOG_PAGE_SIZE, blogPageHref, getBlogPage, sortedPosts } from "@/content/posts";
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
export function BlogIndex({
  crumbs,
  description,
  page = 1,
}: {
  crumbs: Crumb[];
  description: string;
  page?: number;
}) {
  const posts = sortedPosts();
  const current = getBlogPage(page) ?? getBlogPage(1)!;
  const browsable = categoryMeta
    .map((c) => ({ ...c, count: posts.filter((p) => p.category === c.name).length }))
    .filter((c) => c.count > 0);

  return (
    <div className="pt-6 pb-16 sm:pb-20 lg:pb-24">
      <Container>
        <Breadcrumbs items={crumbs} />

        <span className="mt-8 block font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {current.page > 1 ? `Blog · Page ${current.page} of ${current.totalPages}` : "Blog"}
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Notes from building real systems.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">{description}</p>

        <nav aria-label="Browse by topic" className="mt-10">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {/* Every published article, so the size of the library is visible at a glance. */}
            <li>
              <Link
                href="/blog"
                aria-current={page === 1 ? "page" : undefined}
                className="inline-flex items-baseline gap-1.5 text-sm text-text transition-colors hover:text-text"
              >
                All
                <span className="font-mono text-[11px] text-text-faint">{posts.length}</span>
              </Link>
            </li>
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
          <PostList posts={current.posts} />
        </div>
        {current.totalPages > 1 && (
          <nav aria-label="Blog pages" className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6 text-sm">
            {current.page > 1 && (
              <Link href={blogPageHref(current.page - 1)} rel="prev" className="inline-flex min-h-11 items-center rounded-full px-4 text-text-muted transition-colors hover:text-text">
                ← Newer
              </Link>
            )}
            <ol className="flex flex-wrap items-center gap-1">
              {Array.from({ length: current.totalPages }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <Link
                    href={blogPageHref(n)}
                    aria-current={n === current.page ? "page" : undefined}
                    aria-label={`Page ${n}`}
                    className={`inline-grid min-h-11 min-w-11 place-items-center rounded-full font-mono text-xs transition-colors ${
                      n === current.page ? "bg-text text-bg" : "text-text-muted hover:text-text"
                    }`}
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ol>
            {current.page < current.totalPages && (
              <Link href={blogPageHref(current.page + 1)} rel="next" className="inline-flex min-h-11 items-center rounded-full px-4 text-text-muted transition-colors hover:text-text">
                Older →
              </Link>
            )}
            <span className="ml-auto font-mono text-[11px] text-text-faint">
              {(current.page - 1) * BLOG_PAGE_SIZE + 1}–{(current.page - 1) * BLOG_PAGE_SIZE + current.posts.length} of {current.totalPosts}
            </span>
          </nav>
        )}

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
