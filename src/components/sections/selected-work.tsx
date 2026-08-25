import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { projects } from "@/content/projects";

export function SelectedWork() {
  return (
    <section id="work" aria-label="Selected work" className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Selected Work"
          title="Real systems, not tutorials."
          description="Two production projects: an internal operations platform, and a public-facing product site."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delayMs={i * 100}>
              <Link
                href={`/work/${project.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-bg-elevated p-8 shadow-[var(--shadow-card)] transition-colors duration-300 hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 items-center">
                    <Image
                      src={project.image!.src}
                      alt={project.image!.alt}
                      width={140}
                      height={40}
                      className="h-8 w-auto object-contain object-left opacity-90"
                    />
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="mt-1 shrink-0 text-text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-strong"
                  />
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-text">{project.name}</h3>
                <p className="mt-1 text-sm text-text-faint">{project.fullName}</p>
                <p className="mt-4 text-base leading-relaxed text-text-muted">
                  {project.summary}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tech.slice(0, 4).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border pt-5 text-sm text-text-faint">
                  <span>{project.affiliation}</span>
                  {project.confidential ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Lock size={13} /> NDA-safe overview
                    </span>
                  ) : (
                    <span>{project.period}</span>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
