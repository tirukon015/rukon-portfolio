import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { projects } from "@/content/projects";
import { getPostsForProject } from "@/content/posts";
import { site } from "@/content/site";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  openGraphFor,
  PERSON_ID,
  twitterFor,
} from "@/lib/seo";

const title = "Work";
const description =
  "Three projects: a production-operations platform for a router-refurbishment line, an AI research assistant that analyses academic PDFs, and requirement-driven SEO and content development on a production website.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work" },
  openGraph: openGraphFor({ title, description, url: "/work" }),
  twitter: twitterFor(title, description),
};

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/work" },
];

export default function WorkIndexPage() {
  const schema = graph(
    {
      "@type": "CollectionPage",
      "@id": absoluteUrl("/work"),
      url: absoluteUrl("/work"),
      name: `${title} | ${site.name}`,
      description,
      inLanguage: "en-MY",
      about: { "@id": PERSON_ID },
      hasPart: projects.map((p) => ({
        "@type": "CreativeWork",
        name: p.fullName,
        url: absoluteUrl(`/work/${p.slug}`),
        abstract: p.summary,
        author: { "@id": PERSON_ID },
      })),
    },
    breadcrumbSchema(crumbs)
  );

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs items={crumbs} />

        <Reveal className="mt-8 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Work</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Real systems, not tutorials.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">{description}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project, i) => {
            const writing = getPostsForProject(project.slug);
            return (
              <Reveal key={project.slug} delayMs={i * 80}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-bg-elevated p-8 shadow-[var(--shadow-card)] transition-colors duration-300 hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 items-center">
                      {project.image ? (
                        <Image
                          src={project.image.src}
                          alt={project.image.alt}
                          width={140}
                          height={40}
                          className="h-8 w-auto object-contain object-left opacity-90"
                        />
                      ) : (
                        <span className="font-mono text-lg font-semibold tracking-tight text-text">
                          {project.name}
                        </span>
                      )}
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="mt-1 shrink-0 text-text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-strong"
                    />
                  </div>

                  <h2 className="mt-6 text-2xl font-semibold text-text">{project.name}</h2>
                  <p className="mt-1 text-sm text-text-faint">{project.fullName}</p>
                  <p className="mt-4 flex-1 text-base leading-relaxed text-text-muted">
                    {project.summary}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tech.slice(0, 4).map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm text-text-faint">
                    <span>{project.affiliation}</span>
                    <span className="flex items-center gap-3">
                      {writing.length > 0 ? (
                        <span>
                          {writing.length} {writing.length === 1 ? "article" : "articles"}
                        </span>
                      ) : null}
                      {project.confidential ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Lock size={13} /> NDA-safe
                        </span>
                      ) : (
                        <span>{project.period}</span>
                      )}
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
