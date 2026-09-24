import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { about } from "@/content/about";
import { site } from "@/content/site";

/**
 * A short personal section.
 *
 * Portrait, three paragraphs, four facts. It answers who the person is when
 * the project blocks are taken away, and leaves the project detail to the
 * sections that already carry it.
 */
export function About() {
  return (
    <section id="about" aria-label="About me" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">About</span>
            <div className="mt-6 w-48 overflow-hidden rounded-lg bg-bg-elevated-2 sm:w-60">
              <Image
                src="/images/profile.png"
                alt={`Portrait of ${site.name}`}
                width={640}
                height={700}
                sizes="(min-width: 640px) 240px, 192px"
                className="h-auto w-full object-contain"
              />
            </div>
            <h2 className="mt-7 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              {site.name}
            </h2>
            <p className="mt-3 max-w-xs text-base leading-snug text-text-muted">{about.profileTitle}</p>
          </Reveal>

          <Reveal delayMs={80} className="lg:col-span-8">
            <div className="flex max-w-2xl flex-col gap-5">
              {about.short.map((p) => (
                <p key={p} className="text-base leading-relaxed text-text-muted sm:text-lg sm:leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
              {about.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm text-text">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8">
              <Link
                href={`${site.cvHref}?from=about`}
                className="inline-flex items-center gap-2 text-sm font-medium text-text transition-colors hover:text-accent-strong"
              >
                Full resume <ArrowRight size={15} />
              </Link>
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
