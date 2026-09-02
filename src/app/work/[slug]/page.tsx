import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
  return projects.map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.name}: Case Study`;
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

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const others = getOtherProjects(project.slug);
  const next = others[0];
  const relatedPosts = getPostsForProject(project.slug);

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
    <article>
      <JsonLd data={schema} />

      <header className="border-b border-border py-16 sm:py-20">
        <Container>
          <Breadcrumbs items={crumbs} />

          <Reveal className="mt-8 flex flex-wrap items-center gap-4">
            {project.image ? (
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={160}
                height={48}
                className="h-9 w-auto object-contain object-left"
              />
            ) : (
              <span className="font-mono text-xl font-semibold tracking-tight text-text">
                {project.name}
              </span>
            )}
            {project.confidential ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1 font-mono text-xs text-text-faint">
                <Lock size={12} /> NDA-safe overview
              </span>
            ) : null}
            {project.kind === "personal-project" ? (
              <span className="inline-flex items-center rounded-full border border-border-strong px-3 py-1 font-mono text-xs text-text-faint">
                Independent project
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

          {project.links && project.links.length > 0 ? (
            <Reveal delayMs={170} className="mt-8 flex flex-wrap gap-4">
              {project.links.map((link) => (
                <ButtonLink
                  key={link.href}
                  href={link.href}
                  variant="secondary"
                  external={link.external}
                >
                  {link.label} <ArrowUpRight size={15} />
                </ButtonLink>
              ))}
            </Reveal>
          ) : null}
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
                {section.note ? (
                  <p className="mt-5 border-l-2 border-border-strong pl-4 text-sm leading-relaxed text-text-faint">
                    {section.note}
                  </p>
                ) : null}
              </Reveal>
            ))}
          </div>

          {project.status && project.status.length > 0 ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-text">
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
                      <span className="block text-sm font-medium text-text">{item.label}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-text-muted">
                        {item.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {project.techGroups && project.techGroups.length > 0 ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-text">Technical stack</h2>
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

          {project.limitations && project.limitations.length > 0 ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-text">Limitations</h2>
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

          {project.confidential ? (
            <Reveal className="mt-14 rounded-2xl border border-border-strong bg-bg-elevated p-6">
              <p className="flex items-start gap-3 text-sm leading-relaxed text-text-muted">
                <Lock size={16} className="mt-0.5 shrink-0 text-text-faint" />
                This system is proprietary software built for a live business operation. This page
                describes it at a level that&apos;s safe to share publicly: no internal screenshots,
                data, or credentials.
              </p>
            </Reveal>
          ) : null}
        </Container>
      </section>

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

      <footer className="border-t border-border py-16">
        <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group flex items-center gap-3 text-text-muted transition-colors hover:text-text"
            >
              <span className="text-xs uppercase tracking-wide text-text-faint">Next project</span>
              <span className="flex items-center gap-1.5 text-lg font-medium text-text">
                {next.name}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/work" variant="secondary">
              All projects
            </ButtonLink>
            <ButtonLink href="/#contact" variant="secondary">
              Get in touch
            </ButtonLink>
          </div>
        </Container>
      </footer>
    </article>
  );
}
