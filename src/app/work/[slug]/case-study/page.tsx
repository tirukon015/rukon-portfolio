import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, BookOpen, User, Building2, Calendar, Layers } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProjectMark } from "@/components/ui/project-mark";
import { JsonLd } from "@/components/seo/json-ld";
import { getProject, getOtherProjects, projects, type CapabilityState } from "@/content/projects";
import { getPostsForProject, postExcerpt } from "@/content/posts";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  openGraphFor,
  PERSON_ID,
  twitterFor,
} from "@/lib/seo";

export function generateStaticParams() {
  return projects
    .filter((p) => p.sections && p.sections.length > 0)
    .map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.name}: Full Case Study & Technical Architecture`;
  const description = `Detailed technical breakdown and architecture case study for ${project.name}: ${project.tagline}`;
  const share = project.shareImage;
  return {
    title,
    description,
    alternates: { canonical: `/work/${project.slug}/case-study` },
    openGraph: openGraphFor({
      title,
      description,
      url: `/work/${project.slug}/case-study`,
      type: "article",
      ...(share ? { image: { url: share.src, width: share.width, height: share.height, alt: share.alt } } : {}),
    }),
    twitter: twitterFor(title, description, share?.src),
  };
}

const stateLabel: Record<CapabilityState, string> = {
  implemented: "Implemented",
  available: "Built, not live",
  "not-connected": "Not connected",
};

const stateClass: Record<CapabilityState, string> = {
  implemented: "text-accent-strong border-accent",
  available: "text-text-muted border-border-strong",
  "not-connected": "text-text-faint border-border",
};

export default async function FullCaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // If a project has no case study sections yet, 404
  if (!project.sections || project.sections.length === 0) {
    notFound();
  }

  const others = getOtherProjects(project.slug);
  const next = others.find((p) => p.sections && p.sections.length > 0) || others[0];
  const relatedPosts = getPostsForProject(project.slug);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Work", href: "/work" },
    { name: project.name, href: `/work/${project.slug}` },
    { name: "Full Case Study", href: `/work/${project.slug}/case-study` },
  ];

  const schema = graph(
    {
      "@type": "TechArticle",
      "@id": absoluteUrl(`/work/${project.slug}/case-study`),
      url: absoluteUrl(`/work/${project.slug}/case-study`),
      name: `${project.fullName}: Technical Case Study`,
      headline: project.tagline,
      abstract: project.summary,
      inLanguage: "en-MY",
      author: { "@id": PERSON_ID },
      creator: { "@id": PERSON_ID },
      keywords: project.tech.join(", "),
      dependencies: project.tech.join(", "),
      proficiencyLevel: "Expert",
    },
    breadcrumbSchema(crumbs)
  );

  return (
    <article className="scroll-smooth bg-bg">
      <JsonLd data={schema} />

      {/* =========================================================================
          LEVEL 3: FULL CASE STUDY & DEEP TECHNICAL ARCHITECTURE
          Distinct long-form engineering breakdown.
          ========================================================================= */}

      {/* Top Navigation & Return Bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-md py-3.5">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/work/${project.slug}`}
              className="group inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-accent transition-colors hover:text-accent-strong"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Project Overview</span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Full Technical Case Study
            </span>
          </div>
        </Container>
      </div>

      {/* Technical Case Study Header */}
      <section className="border-b border-border bg-gradient-to-b from-bg-elevated/40 via-bg to-bg py-12 sm:py-16 lg:py-20">
        <Container>
          <Breadcrumbs items={crumbs} />

          <Reveal className="mt-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent">
                <BookOpen size={13} className="shrink-0" />
                Full Case Study
              </span>

              <span className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-mono text-xs text-text-faint">
                <Layers size={12} className="shrink-0" />
                {project.category}
              </span>

              {project.confidential && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-border-strong px-2.5 py-1 font-mono text-xs text-text-faint">
                  <Lock size={12} className="shrink-0" /> NDA-Safe Architecture
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
                  {project.name}
                </h1>
                <p className="mt-3 text-lg text-text-muted sm:text-xl">{project.fullName}</p>
              </div>

              <ProjectMark
                project={project}
                width={160}
                height={48}
                className="h-10 w-auto object-contain object-left lg:object-right opacity-90"
                fallbackClassName="font-mono text-xl font-bold tracking-tight text-text"
              />
            </div>

            {/* Technical Metadata Bar: Explicit Role */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm">
              <div className="border-b border-border/60 pb-3 sm:border-b-0 sm:border-r sm:pr-4 sm:pb-0">
                <div className="flex items-center gap-1.5 text-accent">
                  <User size={14} className="shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold">Role</span>
                </div>
                <div className="mt-1.5 text-sm font-bold text-text">
                  {project.role || "Sole Developer"}
                </div>
                {project.roleScope && (
                  <p className="mt-1 text-xs text-text-muted">{project.roleScope}</p>
                )}
              </div>

              <div className="border-b border-border/60 pb-3 sm:border-b-0 lg:border-r lg:pr-4 lg:pb-0">
                <div className="flex items-center gap-1.5 text-text-faint">
                  <Building2 size={14} className="shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">Affiliation / Client</span>
                </div>
                <div className="mt-1.5 text-sm font-medium text-text">{project.affiliation}</div>
              </div>

              <div className="border-b border-border/60 pb-3 sm:border-b-0 sm:border-r sm:pr-4 sm:pb-0">
                <div className="flex items-center gap-1.5 text-text-faint">
                  <Calendar size={14} className="shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">Timeline</span>
                </div>
                <div className="mt-1.5 text-sm font-medium text-text">{project.period}</div>
              </div>

              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-faint block">
                  Documentation Level
                </span>
                <div className="mt-1.5 text-sm font-semibold text-accent">
                  {project.sections.length} Engineering Sections
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Operational Workflow (if present) */}
      {project.workflow.length > 0 ? (
        <section aria-label="Process Workflow" className="border-b border-border py-12 sm:py-16 bg-bg-elevated/20">
          <Container>
            <Reveal>
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  Operational Workflow & State Machine
                </h2>
                <span className="font-mono text-xs text-text-faint">End-to-End Pipeline</span>
              </div>
              <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-4">
                {project.workflow.map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex items-center gap-2.5 rounded-full border border-border-strong bg-bg-elevated px-4 py-2 text-sm font-medium text-text shadow-sm">
                      <span className="font-mono text-xs font-bold text-accent">
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

      {/* Related systems (if present) */}
      {project.ecosystem && project.ecosystem.systems.length > 0 ? (
        <section aria-label={project.ecosystem.label} className="border-b border-border py-12 sm:py-16">
          <Container>
            <Reveal>
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  {project.ecosystem.label}
                </h2>
                <span className="font-mono text-xs text-text-faint">Separate systems</span>
              </div>
              <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {project.ecosystem.systems.map((system) => {
                  const href = system.slug ? `/work/${system.slug}` : system.href;
                  return (
                    <li
                      key={system.name}
                      className="flex flex-col rounded-2xl border border-border bg-bg-elevated p-6"
                    >
                      <span className="font-mono text-[11px] uppercase tracking-wider text-text-faint">
                        {system.relation}
                      </span>
                      <span className="mt-2 text-lg font-semibold text-text">{system.name}</span>
                      {system.summary ? (
                        <p className="mt-2 text-sm leading-relaxed text-text-muted">{system.summary}</p>
                      ) : null}
                      {href ? (
                        <Link
                          href={href}
                          className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-strong"
                        >
                          {system.slug ? "Read its case study" : "Read more"}
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* Main Engineering Sections (Preserved Claude Content) */}
      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-16 sm:gap-20">
            {project.sections.map((section, i) => (
              <Reveal key={section.heading} delayMs={Math.min(i * 30, 120)}>
                <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-wider text-accent mb-3">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
                  {section.heading}
                </h2>

                <div className="mt-5 flex flex-col gap-4">
                  {section.body.map((p, pIdx) => (
                    <p key={pIdx} className="text-base sm:text-lg leading-relaxed text-text-muted">
                      {p}
                    </p>
                  ))}
                </div>

                {section.figures && section.figures.length > 0 ? (
                  <div className="mt-8 flex flex-col gap-8">
                    {section.figures.map((figure) => (
                      <figure
                        key={figure.src}
                        className={
                          figure.wide
                            ? "md:relative md:left-1/2 md:w-[min(72rem,calc(100vw-4rem))] md:-translate-x-1/2"
                            : undefined
                        }
                      >
                        <a
                          href={figure.src}
                          target="_blank"
                          rel="noopener"
                          aria-label={`Open full size: ${figure.alt}`}
                          className="block overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
                        >
                          <Image
                            src={figure.src}
                            alt={figure.alt}
                            width={figure.width}
                            height={figure.height}
                            sizes={
                              figure.wide
                                ? "(min-width: 1216px) 1152px, 100vw"
                                : "(min-width: 768px) 768px, 100vw"
                            }
                            className="h-auto w-full"
                          />
                        </a>
                        <figcaption className="mt-3 font-mono text-xs leading-relaxed text-text-faint">
                          {figure.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}

                {section.note ? (
                  <p className="mt-5 border-l-2 border-accent/60 bg-accent/[0.03] py-2 pl-4 text-sm leading-relaxed text-text-faint">
                    {section.note}
                  </p>
                ) : null}
              </Reveal>
            ))}
          </div>

          {/* Status Matrix */}
          {project.status && project.status.length > 0 ? (
            <Reveal className="mt-20 border-t border-border pt-16">
              <h2 className="text-2xl font-bold tracking-tight text-text">
                What&apos;s live, and what isn&apos;t
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                &ldquo;It exists in the repository&rdquo; and &ldquo;it runs in production&rdquo; are
                different claims. This is the difference, stated rather than left to be assumed.
              </p>
              <ul className="mt-6 flex flex-col divide-y divide-border border-t border-b border-border">
                {project.status.map((item) => (
                  <li key={item.label} className="flex flex-col gap-2 py-4 sm:flex-row sm:gap-6">
                    <span
                      className={`inline-flex h-fit shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide sm:w-36 sm:justify-center ${stateClass[item.state]}`}
                    >
                      {stateLabel[item.state]}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-text">{item.label}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-text-muted">
                        {item.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {/* Grouped Tech Stack */}
          {project.techGroups && project.techGroups.length > 0 ? (
            <Reveal className="mt-16 border-t border-border pt-16">
              <h2 className="text-2xl font-bold tracking-tight text-text">Technical stack</h2>
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {project.techGroups.map((group) => (
                  <div key={group.label}>
                    <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
                      {group.label}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <Tag key={item}>{item}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ) : null}

          {/* Limitations */}
          {project.limitations && project.limitations.length > 0 ? (
            <Reveal className="mt-16 border-t border-border pt-16">
              <h2 className="text-2xl font-bold tracking-tight text-text">Limitations</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {project.limitations.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed text-text-muted">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-text-faint"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {/* Roadmap */}
          {project.roadmap && project.roadmap.length > 0 ? (
            <Reveal className="mt-16 border-t border-border pt-16">
              <h2 className="text-2xl font-bold tracking-tight text-text">What&apos;s next</h2>
              <ol className="mt-5 flex flex-col gap-3">
                {project.roadmap.map((item, i) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed text-text-muted">
                    <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          ) : null}

          {/* Source and links */}
          {project.links && project.links.length > 0 ? (
            <Reveal className="mt-16 border-t border-border pt-16">
              <h2 className="text-2xl font-bold tracking-tight text-text">Source and further reading</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <ButtonLink
                    key={link.href}
                    href={link.href}
                    variant="secondary"
                    external={link.external}
                  >
                    {link.label}
                  </ButtonLink>
                ))}
              </div>
            </Reveal>
          ) : null}

          {/* Confidentiality Notice */}
          {project.confidential ? (
            <Reveal className="mt-14 rounded-2xl border border-border-strong bg-bg-elevated p-6">
              <p className="flex items-start gap-3 text-sm leading-relaxed text-text-muted">
                <Lock size={16} className="mt-0.5 shrink-0 text-text-faint" />
                {project.confidentialNotice ?? (
                  <>
                    This system is proprietary software built for a live business operation. This page
                    describes it at a level that&apos;s safe to share publicly: no internal screenshots,
                    data, or credentials.
                  </>
                )}
              </p>
            </Reveal>
          ) : null}

          {/* Explicit Back to Overview CTA Banner */}
          <Reveal className="mt-20 rounded-3xl border-2 border-border bg-bg-elevated p-8 sm:p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-text">Finished the technical breakdown?</h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-text-muted">
              Return to the concise HR overview or discover other projects in the portfolio.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href={`/work/${project.slug}`} variant="primary">
                <ArrowLeft size={15} /> Back to Project Overview
              </ButtonLink>
              <ButtonLink href="/work" variant="secondary">
                All Projects
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Related Writing */}
      {relatedPosts.length > 0 ? (
        <section aria-label="Related writing" className="border-t border-border py-16">
          <Container className="max-w-3xl">
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
              Writing from this work
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
                    <p className="mt-1 text-sm text-text-muted">{postExcerpt(post)}</p>
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

      {/* Footer Navigation: Back to Overview & Next Project */}
      <footer className="border-t border-border py-16">
        <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <Link
            href={`/work/${project.slug}`}
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to {project.name} Overview</span>
          </Link>

          {next && next.slug !== project.slug ? (
            <Link
              href={`/work/${next.slug}/case-study`}
              className="group flex items-center gap-3 text-text-muted transition-colors hover:text-text"
            >
              <span className="text-xs uppercase tracking-wide text-text-faint">Next Case Study</span>
              <span className="flex items-center gap-1.5 text-base font-medium text-text">
                {next.name}
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          ) : null}
        </Container>
      </footer>
    </article>
  );
}
