"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { site } from "@/content/site";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally without exposing details to user interface
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="pt-6 pb-24 sm:pb-32">
      <Container className="max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Error</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Something went wrong.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
          An unexpected problem occurred while loading this view. You can attempt to reload the component or navigate back to the main site.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-text px-4 py-2 text-xs font-semibold text-bg transition-colors hover:bg-accent-strong hover:text-white"
          >
            <RotateCcw size={14} /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-text transition-colors hover:text-accent-strong"
          >
            Home <ArrowRight size={14} />
          </Link>
          <Link
            href={site.workHref}
            className="inline-flex items-center gap-1.5 text-sm text-text transition-colors hover:text-accent-strong"
          >
            Work <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </div>
  );
}
