"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { categories, sortedPosts, type PostCategory } from "@/content/posts";
import { estimateReadingTime } from "@/lib/reading-time";
import { cn } from "@/lib/utils";

export function BlogIndex() {
  const [active, setActive] = useState<PostCategory | "All">("All");
  const posts = useMemo(() => sortedPosts(), []);
  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <div className="py-24">
      <Container>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Blog</span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Notes on systems, operations, and building things.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
          Focused, practical notes drawn from real project work: production and operations
          systems, IT systems, and web development from Figma through to a live build.
        </p>

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter posts by category">
          <button
            type="button"
            onClick={() => setActive("All")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              active === "All"
                ? "border-accent text-accent-strong"
                : "border-border-strong text-text-muted hover:text-text"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                active === cat
                  ? "border-accent text-accent-strong"
                  : "border-border-strong text-text-muted hover:text-text"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <Reveal key={post.slug} delayMs={Math.min(i * 40, 200)}>
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
                </div>
                <h2 className="mt-3 text-lg font-semibold text-text">{post.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-text-faint">
                  <span>{estimateReadingTime(post.sections)}</span>
                  <span className="inline-flex items-center gap-1.5 text-accent-strong">
                    Read
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-sm text-text-muted">No posts in this category yet.</p>
        ) : null}
      </Container>
    </div>
  );
}
