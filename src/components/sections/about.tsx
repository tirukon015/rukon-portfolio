import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { about } from "@/content/about";
import { site } from "@/content/site";

export function About() {
  return (
    <section id="about" aria-label="About me" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <Reveal className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          <div className="w-48 shrink-0 overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated-2 sm:w-56">
            <Image
              src="/images/profile.png"
              alt={`Portrait of ${site.name}`}
              width={640}
              height={700}
              sizes="(min-width: 640px) 224px, 192px"
              className="h-auto w-full object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
              About
            </span>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                {site.name}
              </h2>
              <span className="text-sm font-medium text-text-muted">{about.profileTitle}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {about.profileTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-strong px-3 py-1 font-mono text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1.3fr_1fr]">
          <Reveal delayMs={80}>
            <div className="flex flex-col gap-4">
              {about.paragraphs.map((p) => (
                <p key={p} className="text-base leading-relaxed text-text-muted">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <ButtonLink href={site.resumeHref} variant="secondary" external download={site.resumeFileName}>
                Download Resume
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delayMs={140}>
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              {about.facts.map((fact) => (
                <div key={fact.label} className="bg-bg-elevated p-6">
                  <dt className="font-mono text-xs uppercase tracking-wide text-text-faint">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-sm text-text">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
