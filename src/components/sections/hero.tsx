import { Download, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { CursorGrid } from "@/components/cursor-grid";
import { HeroSpotlight } from "@/components/hero-spotlight";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative isolate flex min-h-[92vh] items-center overflow-hidden border-b border-border"
    >
      <CursorGrid />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg"
      />

      <Container className="relative z-10 py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-elevated px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="text-xs text-text-muted">Open to opportunities</span>
            </div>

            <p className="mt-6 font-mono text-sm text-accent">Hello, I&apos;m</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-text sm:text-6xl md:text-7xl">
              {site.name}
            </h1>
            <p className="mt-4 text-xl font-medium text-text-muted sm:text-2xl">{site.role}</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
              {site.statement}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/#work" variant="primary">
                View My Work
              </ButtonLink>
              <ButtonLink
                href={site.resumeHref}
                variant="secondary"
                external
                download={site.resumeFileName}
              >
                <Download size={16} /> Download Resume
              </ButtonLink>
            </div>

            <div className="mt-10 flex items-center gap-5">
              <a
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-text-muted transition-colors hover:text-accent-strong"
              >
                <GithubIcon size={20} />
              </a>
              <a
                href={site.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-text-muted transition-colors hover:text-accent-strong"
              >
                <LinkedinIcon size={20} />
              </a>
              <a
                href={site.emailHref}
                aria-label="Email"
                className="text-text-muted transition-colors hover:text-accent-strong"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div className="hidden h-[26rem] lg:block">
            <HeroSpotlight />
          </div>
        </div>
      </Container>
    </section>
  );
}
