import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { capabilities } from "@/content/skills";
import { getProject } from "@/content/projects";

export function Capabilities() {
  return (
    <section id="capabilities" aria-label="What I do" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="What I Do"
          title="Where my work sits."
          description="Grouped by the kind of problem rather than by technology. Each one names the project it comes from."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, i) => {
            const evidence = (cap.evidence ?? [])
              .map((slug) => getProject(slug))
              .filter((p): p is NonNullable<typeof p> => Boolean(p));

            return (
              <Reveal
                key={cap.title}
                delayMs={i * 50}
                className="flex flex-col rounded-2xl border border-border bg-bg-elevated p-6"
              >
                <h3 className="text-sm font-semibold text-text">{cap.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                  {cap.description}
                </p>
                {evidence.length > 0 ? (
                  <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-faint">
                    <span className="font-mono uppercase tracking-wide">Evidence</span>
                    {evidence.map((project, index) => (
                      <span key={project.slug} className="inline-flex items-center gap-2">
                        {index > 0 ? <span aria-hidden="true">&middot;</span> : null}
                        <Link
                          href={`/work/${project.slug}`}
                          className="text-accent-strong transition-colors hover:text-accent"
                        >
                          {project.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                ) : null}
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
