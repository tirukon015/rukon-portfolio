import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { sortedPosts } from "@/content/posts";
import { estimateReadingTime } from "@/lib/reading-time";
import { site } from "@/content/site";

function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The three newest posts, as rows.
 *
 * Self-disabling: renders nothing while there are no posts, so the section
 * simply doesn't exist on the page until real writing exists.
 */
export function LatestWriting() {
  const posts = sortedPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section aria-label="Latest writing" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Writing" title="Notes from the work." />
          <Link
            href={site.blogHref}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            All writing <ArrowRight size={14} />
          </Link>
        </div>

        <ol className="mt-12 divide-y divide-border border-t border-border">
          {posts.map((post, i) => (
            <Reveal key={post.slug} as="li" delayMs={i * 70}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-1 gap-2 py-7 md:grid-cols-12 md:gap-8"
              >
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint md:col-span-3 md:pt-1">
                  <time dateTime={post.date}>{shortDate(post.date)}</time>
                  <span aria-hidden="true"> · </span>
                  {post.category}
                </p>
                <div className="md:col-span-8">
                  <h3 className="text-xl font-semibold tracking-tight text-text transition-colors group-hover:text-accent-strong">
                    {post.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">{post.description}</p>
                  <p className="mt-3 text-xs text-text-faint">{estimateReadingTime(post.sections)}</p>
                </div>
                <span className="hidden items-start justify-end pt-1 md:col-span-1 md:flex">
                  <ArrowRight
                    size={16}
                    className="text-text-faint transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent-strong"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
