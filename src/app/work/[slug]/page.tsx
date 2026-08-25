import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { ButtonLink } from "@/components/ui/button";
import { getProject, projects } from "@/content/projects";
import { posts } from "@/content/posts";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name}: Case Study`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const other = projects.find((p) => p.slug !== project.slug);
  const relatedPosts = posts.filter((p) =>
    p.related?.some((link) => link.href === `/work/${project.slug}`)
  );

  return (
    <article>
      <header className="border-b border-border py-20">
        <Container>
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft size={14} /> Selected Work
          </Link>

          <Reveal className="mt-8 flex flex-wrap items-center gap-4">
            <Image
              src={project.image!.src}
              alt={project.image!.alt}
              width={160}
              height={48}
              className="h-9 w-auto object-contain object-left"
            />
            {project.confidential ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1 font-mono text-xs text-text-faint">
                <Lock size={12} /> NDA-safe overview
              </span>
            ) : null}
          </Reveal>

          <Reveal delayMs={60}>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
              {project.tagline}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">
              {project.summary}
            </p>
          </Reveal>

          <Reveal delayMs={100} className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-text-faint">Role</dt>
              <dd className="mt-1 text-sm text-text">{project.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-text-faint">Period</dt>
              <dd className="mt-1 text-sm text-text">{project.period}</dd>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <dt className="font-mono text-xs uppercase tracking-wide text-text-faint">
                Affiliation
              </dt>
              <dd className="mt-1 text-sm text-text">{project.affiliation}</dd>
            </div>
          </Reveal>

          <Reveal delayMs={140} className="mt-8 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </Reveal>
        </Container>
      </header>

      {project.workflow.length > 0 ? (
        <section aria-label="Process" className="border-b border-border py-14">
          <Container>
            <Reveal>
              <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
                How it flows
              </h2>
              <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-4">
                {project.workflow.map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex items-center gap-2 rounded-full border border-border-strong bg-bg-elevated px-4 py-2 text-sm text-text">
                      <span className="font-mono text-xs text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {step}
                    </span>
                    {i < project.workflow.length - 1 ? (
                      <ArrowRight size={14} className="shrink-0 text-text-faint" aria-hidden="true" />
                    ) : null}
                  </li>
                ))}
              </ol>
            </Reveal>
          </Container>
        </section>
      ) : null}

      <section className="py-20">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-16">
            {project.sections.map((section, i) => (
              <Reveal key={section.heading} delayMs={Math.min(i * 40, 160)}>
                <h2 className="text-2xl font-semibold tracking-tight text-text">
                  {section.heading}
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                  {section.body.map((p) => (
                    <p key={p} className="text-base leading-relaxed text-text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          {project.confidential ? (
            <Reveal className="mt-14 rounded-2xl border border-border-strong bg-bg-elevated p-6">
              <p className="flex items-start gap-3 text-sm leading-relaxed text-text-muted">
                <Lock size={16} className="mt-0.5 shrink-0 text-text-faint" />
                This system is proprietary software built for a live business operation. This
                page describes it at a level that&apos;s safe to share publicly: no internal
                screenshots, data, or credentials.
              </p>
            </Reveal>
          ) : null}
        </Container>
      </section>

      {relatedPosts.length > 0 ? (
        <section aria-label="From the blog" className="border-t border-border py-16">
          <Container className="max-w-3xl">
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
              From the blog
            </h2>
            <div className="mt-6 flex flex-col gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex items-center justify-between gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0"
                >
                  <div>
                    <h3 className="text-base font-medium text-text">{post.title}</h3>
                    <p className="mt-1 text-sm text-text-muted">{post.description}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-text-faint transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <footer className="border-t border-border py-16">
        <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          {other ? (
            <Link
              href={`/work/${other.slug}`}
              className="group flex items-center gap-3 text-text-muted transition-colors hover:text-text"
            >
              <span className="text-xs uppercase tracking-wide text-text-faint">Next project</span>
              <span className="flex items-center gap-1.5 text-lg font-medium text-text">
                {other.name}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          ) : (
            <span />
          )}
          <ButtonLink href="/#contact" variant="secondary">
            Get in touch
          </ButtonLink>
        </Container>
      </footer>
    </article>
  );
}
