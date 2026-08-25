import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { getPost, getRelatedPosts, posts } from "@/content/posts";
import { estimateReadingTime } from "@/lib/reading-time";
import { site } from "@/content/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);

  return (
    <article className="py-20">
      <Container className="max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={14} /> Blog
        </Link>

        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-faint">
            <span className="font-mono uppercase tracking-wide text-accent">{post.category}</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span aria-hidden="true">&middot;</span>
            <span>{estimateReadingTime(post.sections)}</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-text-muted">{post.description}</p>
          <p className="mt-4 text-sm text-text-faint">By {site.name}</p>
        </Reveal>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-strong px-3 py-1 font-mono text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-10">
          {post.sections.map((section, i) => (
            <Reveal key={section.heading} delayMs={Math.min(i * 30, 150)}>
              <h2 className="text-xl font-semibold text-text">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-4">
                {section.body.map((p) => (
                  <p key={p} className="text-base leading-relaxed text-text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        {post.related && post.related.length > 0 ? (
          <Reveal className="mt-14 rounded-2xl border border-border-strong bg-bg-elevated p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
              Related
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {post.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm text-accent-strong transition-colors hover:text-accent"
                  >
                    {link.label} <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </Container>

      {related.length > 0 ? (
        <Container className="mt-20 max-w-3xl border-t border-border pt-14">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
            More on {post.category}
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex items-center justify-between gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0"
              >
                <div>
                  <h3 className="text-base font-medium text-text">{p.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{p.description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-text-faint transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
