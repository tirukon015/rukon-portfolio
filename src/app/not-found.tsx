import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="py-24 sm:py-32">
      <Container className="max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">404</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          That page is not here.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
          The address may have changed or never existed. Articles that moved redirect to their
          new home, so a link that lands here is most likely a typo.
        </p>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          <li>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text transition-colors hover:text-accent-strong">
              Home <ArrowRight size={14} />
            </Link>
          </li>
          <li>
            <Link href={site.workHref} className="inline-flex items-center gap-1.5 text-sm text-text transition-colors hover:text-accent-strong">
              Work <ArrowRight size={14} />
            </Link>
          </li>
          <li>
            <Link href={site.blogHref} className="inline-flex items-center gap-1.5 text-sm text-text transition-colors hover:text-accent-strong">
              Writing <ArrowRight size={14} />
            </Link>
          </li>
        </ul>
      </Container>
    </div>
  );
}
