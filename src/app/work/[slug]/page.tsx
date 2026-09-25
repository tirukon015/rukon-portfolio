import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Lock,
  User,
  Calendar,
  Building2,
  FolderGit2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProjectMark } from "@/components/ui/project-mark";
import { JsonLd } from "@/components/seo/json-ld";
import { getProject, getOtherProjects, projects } from "@/content/projects";
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
  return projects.map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.name}: Project Overview`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: openGraphFor({
      title,
      description: project.summary,
      url: `/work/${project.slug}`,
      type: "article",
    }),
    twitter: twitterFor(title, project.summary),
  };
}

export default async function ProjectOverviewPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const others = getOtherProjects(project.slug);
  const next = others[0];
  const relatedPosts = getPostsForProject(project.slug);
  const hasCaseStudy = Boolean(project.sections && project.sections.length > 0);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Work", href: "/work" },
    { name: project.name, href: `/work/${project.slug}` },
  ];

  const schema = graph(
    {
      "@type": "CreativeWork",
      "@id": absoluteUrl(`/work/${project.slug}`),
      url: absoluteUrl(`/work/${project.slug}`),
      name: project.fullName,
      alternateName: project.name,
      headline: project.tagline,
      abstract: project.summary,
      inLanguage: "en-MY",
      author: { "@id": PERSON_ID },
      creator: { "@id": PERSON_ID },
      keywords: project.tech.join(", "),
      ...(project.links?.length
        ? { sameAs: project.links.filter((l) => l.external).map((l) => l.href) }
        : {}),
    },
    breadcrumbSchema(crumbs)
  );

  return (
    <article className="scroll-smooth">
      <JsonLd data={schema} />

      {/* =========================================================================
          LEVEL 2: EXECUTIVE HR-FRIENDLY PROJECT OVERVIEW (THE HOOK)
          Dedicated concise overview designed to be scanned in 10-20 seconds.
          ========================================================================= */}
      <section className="py-10 sm:py-14 lg:py-16">
        <Container>
          {/* Breadcrumbs + Mode Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
            <Breadcrumbs items={crumbs} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              HR Project Overview
            </span>
          </div>

          {/* Top Classification Bar */}
          <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-lg bg-accent/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                {project.category}
              </span>

              {project.confidential ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-2.5 py-0.5 font-mono text-xs text-text-faint">
                  <Lock size={12} className="shrink-0" /> NDA-Safe Overview
                </span>
              ) : (
                <span className="inline-flex items-center rounded-lg border border-border px-2.5 py-0.5 font-mono text-xs text-text-faint">
                  {project.period}
                </span>
              )}

              {project.kind === "university-project" && (
                <span className="inline-flex items-center rounded-lg border border-border px-2.5 py-0.5 font-mono text-xs text-text-faint">
                  University Project
                </span>
              )}

              {hasCaseStudy && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/[0.04] px-2.5 py-0.5 font-mono text-xs text-accent">
                  <BookOpen size={11} /> Case Study Ready
                </span>
              )}
            </div>

            <ProjectMark
              project={project}
              width={160}
              height={44}
              className="h-8 w-auto object-contain object-right"
              fallbackClassName="font-mono text-lg font-semibold tracking-tight text-text"
            />
          </Reveal>

          {/* Title & Subtitle */}
          <Reveal delayMs={40} className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
              {project.name}
            </h1>
            <p className="mt-2 text-base text-text-muted sm:text-lg">{project.fullName}</p>

            {/* High-Impact Value Proposition Callout */}
            <div className="mt-6 rounded-2xl border-2 border-accent/30 bg-accent/[0.05] p-5 sm:p-6 shadow-sm">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent block mb-1.5">
                Core Value Proposition
              </span>
              <p className="text-lg sm:text-xl font-medium leading-relaxed text-text">
                {project.hrOverview?.valueProposition || project.tagline}
              </p>
            </div>

            {/* Short Executive Summary */}
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-muted sm:text-lg">
              {project.summary}
            </p>
          </Reveal>

          {/* Scannable Metadata Grid: Role Prominently Stated */}
          <Reveal delayMs={80} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border/80 bg-bg-elevated p-6 shadow-sm">
            <div className="border-b border-border/60 pb-4 sm:border-b-0 sm:border-r sm:pr-4 sm:pb-0">
              <div className="flex items-center gap-1.5 text-accent">
                <User size={14} className="shrink-0" />
                <dt className="font-mono text-[11px] uppercase tracking-wider font-bold">Role</dt>
              </div>
              <dd className="mt-2 text-base font-bold text-text">
                {project.hrOverview?.role || "Sole Developer"}
              </dd>
              {project.hrOverview?.roleScope && (
                <p className="mt-1 text-xs leading-normal text-text-muted">
                  {project.hrOverview.roleScope}
                </p>
              )}
            </div>

            <div className="border-b border-border/60 pb-4 sm:border-b-0 lg:border-r lg:pr-4 lg:pb-0">
              <div className="flex items-center gap-1.5 text-text-faint">
                <Building2 size={14} className="shrink-0" />
                <dt className="font-mono text-[11px] uppercase tracking-wider">Context / Client</dt>
              </div>
              <dd className="mt-2 text-sm font-semibold text-text">
                {project.hrOverview?.context || project.affiliation}
              </dd>
            </div>

            <div className="border-b border-border/60 pb-4 sm:border-b-0 sm:border-r sm:pr-4 sm:pb-0">
              <div className="flex items-center gap-1.5 text-text-faint">
                <Calendar size={14} className="shrink-0" />
                <dt className="font-mono text-[11px] uppercase tracking-wider">Timeline / Period</dt>
              </div>
              <dd className="mt-2 text-sm font-semibold text-text">{project.period}</dd>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-text-faint">
                <FolderGit2 size={14} className="shrink-0" />
                <dt className="font-mono text-[11px] uppercase tracking-wider">Category</dt>
              </div>
              <dd className="mt-2 text-sm font-bold text-accent">{project.category}</dd>
            </div>
          </Reveal>

          {/* Key Value Highlights Box */}
          <Reveal delayMs={120} className="mt-8 rounded-2xl border border-border bg-bg-elevated p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Key Highlights & Practical Impact
              </h2>
              <span className="font-mono text-xs text-text-faint">Executive Scan</span>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(project.hrOverview?.highlights || project.highlights).map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-text">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            {/* Core Tech Stack */}
            <div className="mt-8 border-t border-border pt-6">
              <span className="block font-mono text-[11px] uppercase tracking-wider text-text-faint mb-3">
                Technologies Used
              </span>
              <div className="flex flex-wrap gap-2">
                {(project.hrOverview?.technologies || project.tech).map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          </Reveal>

          {/* =========================================================================
              STRONG VISUAL BOUNDARY: CLEAR SEPARATION TO ENTER FULL CASE STUDY
              Visually communicates that the HR overview ends here, and the full
              technical case study is a separate, intentional deep dive.
              ========================================================================= */}
          {hasCaseStudy ? (
            <Reveal delayMs={160} className="mt-12 rounded-3xl border-2 border-accent/40 bg-gradient-to-br from-bg-elevated via-bg-elevated to-accent/[0.08] p-8 sm:p-12 shadow-lg">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-md bg-accent/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent">
                    LEVEL 2 — DEEP TECHNICAL PROOF
                  </span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-text sm:text-3xl lg:text-4xl">
                    Ready to explore the build?
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-text-muted sm:text-lg">
                    A detailed look at the end-to-end architecture, process workflows, key engineering decisions, live production capabilities, challenges, and results.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  <ButtonLink
                    href={`/work/${project.slug}/case-study`}
                    variant="primary"
                    className="gap-3 text-base font-semibold px-8 py-4 shadow-md"
                  >
                    <span>View Full Case Study</span>
                    <ArrowRight size={18} />
                  </ButtonLink>

                  {project.links && project.links.length > 0
                    ? project.links.map((link) => (
                        <ButtonLink
                          key={link.href}
                          href={link.href}
                          variant="secondary"
                          external={link.external}
                        >
                          {link.label} <ArrowUpRight size={15} />
                        </ButtonLink>
                      ))
                    : null}
                </div>
              </div>
            </Reveal>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {project.links && project.links.length > 0
                ? project.links.map((link) => (
                    <ButtonLink
                      key={link.href}
                      href={link.href}
                      variant="secondary"
                      external={link.external}
                    >
                      {link.label} <ArrowUpRight size={15} />
                    </ButtonLink>
                  ))
                : null}
            </div>
          )}

          {/* Confidentiality Notice */}
          {project.confidential && (
            <Reveal delayMs={200} className="mt-8 rounded-xl border border-border bg-bg-elevated/30 p-4">
              <p className="flex items-center gap-2.5 font-mono text-xs text-text-faint">
                <Lock size={13} className="shrink-0 text-text-faint" />
                This system is proprietary commercial software. Information presented here is scoped for public review without disclosing internal credentials or customer records.
              </p>
            </Reveal>
          )}
        </Container>
      </section>

      {/* Related Writing (if any) */}
      {relatedPosts.length > 0 ? (
        <section aria-label="Related writing" className="border-t border-border py-14">
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

      {/* Navigation Footer */}
      <footer className="border-t border-border py-14">
        <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft size={14} /> Back to all projects
          </Link>

          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group flex items-center gap-3 text-text-muted transition-colors hover:text-text"
            >
              <span className="text-xs uppercase tracking-wide text-text-faint">Next project</span>
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
