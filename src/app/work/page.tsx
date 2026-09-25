import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { WorkFilter } from "@/components/work/work-filter";
import { projects, upcomingProjects } from "@/content/projects";
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
  "Real-world operational systems, offline workstations, full-stack software, and high-performance websites. Scan the Level 1 HR overviews below or dive into detailed case studies.";

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

  // Precompute post counts for fast client rendering
  const postCountsByProject: Record<string, number> = {};
  for (const p of projects) {
    postCountsByProject[p.slug] = getPostsForProject(p.slug).length;
  }

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs items={crumbs} />

        <Reveal className="mt-8 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Work & Systems</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Real systems, not tutorials.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Every project has two levels: a <strong>quick HR-friendly overview</strong> below for rapid scanning (10–20 seconds), and a <strong>full technical case study</strong> with in-depth architecture, code, and verification proof.
          </p>
        </Reveal>

        {/* Category Navigation & Level 1 HR Overviews */}
        <WorkFilter
          projects={projects}
          upcomingProjects={upcomingProjects}
          postCountsByProject={postCountsByProject}
        />
      </Container>
    </div>
  );
}

