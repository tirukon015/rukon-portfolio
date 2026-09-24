import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CursorGrid } from "@/components/cursor-grid";
import { HeroSpotlight } from "@/components/hero-spotlight";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";

/**
 * The hero.
 *
 * Statement first: the headline says what the work is, the paragraph says how
 * it is done, and three checkable facts sit beneath in place of a badge. The
 * name is deliberately not the headline; it is in the header, the title tag
 * and the About section, and repeating it here would spend the largest type
 * on the page on the least informative line.
 *
 * Composition is asymmetric: seven columns of type, five of portrait, with
 * the portrait bleeding to the section's edge on large screens so it reads
 * as part of the page rather than an image placed beside text.
 */
export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative isolate overflow-hidden border-b border-border"
    >
      <CursorGrid />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg"
      />

      <Container className="relative z-10 pt-16 pb-14 sm:pt-20 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-8">
          <div className="min-w-0">
            <p className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
              <span className="whitespace-nowrap">{site.name}</span>
              <span aria-hidden="true" className="hidden text-text-faint/60 sm:inline">
                /
              </span>
              <span className="whitespace-nowrap">{site.location}</span>
            </p>

            <h1 className="mt-8 max-w-[19ch] text-display font-semibold text-text text-balance">
              {site.headline}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
              {site.statement}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href="/#work" variant="primary">
                See the work <ArrowRight size={15} />
              </ButtonLink>
              <Link
                href={`${site.cvHref}?from=hero`}
                className="text-sm text-text-muted underline decoration-border-strong underline-offset-[6px] transition-colors hover:text-text hover:decoration-accent"
              >
                Resume
              </Link>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-1 gap-x-8 gap-y-3 border-t border-border pt-6 sm:grid-cols-[auto_1fr]">
              {site.now.map((item) => (
                <div key={item.label} className="contents">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint sm:pt-0.5">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-text-muted">
                    {item.href ? (
                      <Link href={item.href} className="transition-colors hover:text-text">
                        {item.value}
                      </Link>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/*
            The portrait. On large screens it takes the remaining five columns
            and a fixed height so the text column sets the section's rhythm.
            Below that it sits under the copy at a height the phone can afford,
            keeping the interaction (tap to reveal) rather than dropping it.
          */}
          <div className="relative h-64 sm:h-88 lg:h-[28rem]">
            <HeroSpotlight />
          </div>
        </div>
      </Container>
    </section>
  );
}
