import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { experience } from "@/content/experience";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";

/**
 * Background, in three rows.
 *
 * Period, then role and organisation, then one summary line and the case
 * studies the role produced. The bullet lists stay in `experience.ts` for
 * the CV; the homepage only needs enough to establish where the work happened.
 */
export function Experience() {
  return (
    <section id="experience" aria-label="Professional experience" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Experience" title="Where the work happened." />
          <Link
            href={`${site.cvHref}?from=about`}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            Full resume <ArrowRight size={14} />
          </Link>
        </div>

        <ol className="mt-12 divide-y divide-border border-t border-border">
          {experience.map((entry, i) => (
            <Reveal key={entry.org + entry.role} as="li" delayMs={i * 70} className="grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:gap-8 md:py-9">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint md:col-span-3 md:pt-2">
                {entry.period}
              </span>
              <div className="md:col-span-9">
                <h3 className="max-w-2xl text-xl font-semibold tracking-tight text-text text-balance sm:text-2xl">
                  {entry.role}
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  {entry.org}
                  <span aria-hidden="true"> · </span>
                  {entry.location}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">
                  {entry.summary}
                </p>
                {(entry.projects ?? []).length > 0 ? (
                  <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {(entry.projects ?? []).map((slug) => {
                      const project = getProject(slug);
                      if (!project) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/work/${slug}`}
                          className="inline-flex items-center gap-1.5 text-sm text-accent-strong transition-colors hover:text-accent"
                        >
                          {project.name} case study <ArrowUpRight size={13} />
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
