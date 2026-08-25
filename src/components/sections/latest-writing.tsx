import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { sortedPosts } from "@/content/posts";
import { estimateReadingTime } from "@/lib/reading-time";
import { site } from "@/content/site";

/**
 * Self-disabling: renders nothing while there are no posts, so the section
 * simply doesn't exist on the page until real writing exists in
 * src/content/posts.ts (or that file is swapped for a CMS/MDX source).
 */
export function LatestWriting() {
  const posts = sortedPosts();
  if (posts.length === 0) return null;

  return (
    <section aria-label="Latest writing" className="border-b border-border py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Writing" title="From the blog." />
          <Link
            href={site.blogHref}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent-strong"
          >
            View all posts <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <Reveal key={post.slug} delayMs={i * 80}>
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
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span aria-hidden="true">&middot;</span>
                  <span>{estimateReadingTime(post.sections)}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-text">{post.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{post.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-strong">
                  Read article
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
