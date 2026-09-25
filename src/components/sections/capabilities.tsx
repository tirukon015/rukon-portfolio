import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { capabilities, stack } from "@/content/skills";
import { getProject } from "@/content/projects";

/**
 * What I build: five areas as an editorial list, not twelve cards.
 *
 * Each area names the project that backs it. The tools follow as one plain
 * sentence, so the stack is stated without becoming a wall of chips.
 */
export function Capabilities() {
  const primary = stack.find((s) => s.tier === "Primary")?.items ?? [];
  const working = stack.find((s) => s.tier === "Working")?.items ?? [];

  return (
    <section id="capabilities" aria-label="What I build" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Reveal className="max-w-md">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  What I Build
                </span>
                <h2 className="mt-3 text-display-sm font-semibold text-text">Five kinds of work.</h2>
                <p className="mt-4 text-base leading-relaxed text-text-muted">
                  Grouped by the problem rather than the technology. Each one names the project it
                  comes from.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ol className="divide-y divide-border border-t border-border">
              {capabilities.map((cap, i) => {
                const evidence = (cap.evidence ?? [])
                  .map((slug) => getProject(slug))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));

                return (
                  <Reveal key={cap.title} as="li" delayMs={i * 60} className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:gap-6 sm:py-7">
                    <span className="font-mono text-xs text-accent sm:col-span-1 sm:pt-1.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="sm:col-span-11">
                      <h3 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{cap.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
                        {cap.description}
                      </p>
                      {evidence.length > 0 ? (
                        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
                          <span>Evidence</span>
                          {evidence.map((project, index) => (
                            <span key={project.slug} className="inline-flex items-center gap-2">
                              {index > 0 ? <span aria-hidden="true">·</span> : null}
                              <Link
                                href={`/work/${project.slug}`}
                                className="text-text-muted transition-colors hover:text-accent-strong"
                              >
                                {project.name}
                              </Link>
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </Reveal>
                );
              })}
            </ol>

            <Reveal delayMs={280} className="mt-8 max-w-2xl">
              <p className="text-sm leading-relaxed text-text-faint">
                <span className="text-text-muted">Mostly in</span> {primary.join(", ")}.{" "}
                <span className="text-text-muted">Also</span> {working.join(", ")}.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
