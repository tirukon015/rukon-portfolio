import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { WorkFilter, type WorkFilterItem } from "@/components/work/work-filter";
import { HRProjectCard } from "@/components/work/hr-project-card";
import { UpcomingProjectCard } from "@/components/work/upcoming-project-card";
import { allProjects, publicProjects, upcomingProjects, type Project } from "@/content/projects";
import { getPostCountsByProject } from "@/content/posts";
import { site } from "@/content/site";
import { isAuthorizedSession } from "@/lib/confidentiality/auth";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  openGraphFor,
  PERSON_ID,
  twitterFor,
} from "@/lib/seo";


/**
 * Articles are released on an editorial schedule (see `publishedPosts`), so
 * this route re-renders hourly to pick up an article on its publication day.
 */
export const revalidate = 3600;

const title = "Work";
const description =
  "Case studies of real systems: a Next.js and PostgreSQL operations platform, a Web Bluetooth label engine, an AI inspection system, an inventory management system, a production website, a live AI research assistant and iOS apps.";

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

export default async function WorkIndexPage() {
  const isAuthorized = await isAuthorizedSession();
  const currentProjects: Project[] = isAuthorized
    ? allProjects.filter((p: Project) => !p.hidden)
    : publicProjects;

  const schema = graph(
    {
      "@type": "CollectionPage",
      "@id": absoluteUrl("/work"),
      url: absoluteUrl("/work"),
      name: `${title} | ${site.name}`,
      description,
      inLanguage: "en-MY",
      about: { "@id": PERSON_ID },
      hasPart: currentProjects.map((p: Project) => ({
        "@type": "CreativeWork",
        name: p.fullName,
        url: absoluteUrl(`/work/${p.slug}`),
        abstract: p.summary,
        author: { "@id": PERSON_ID },
      })),
    },
    breadcrumbSchema(crumbs)
  );

  // One pass over the articles for every project's count, and the cards are
  // rendered here on the server: the client filter receives only categories
  // and finished markup, never project data.
  const counts = getPostCountsByProject(currentProjects.map((p) => p.slug), isAuthorized);
  const items: WorkFilterItem[] = [
    ...currentProjects.map((p) => ({
      slug: p.slug,
      categorySlug: p.categorySlug,
      categories: p.categories,
      card: <HRProjectCard project={p} articleCount={counts[p.slug] ?? 0} />,
    })),
    ...upcomingProjects.map((p) => ({
      slug: p.slug,
      categorySlug: p.categorySlug,
      categories: p.categories,
      card: <UpcomingProjectCard project={p} />,
    })),
  ];

  return (
    <div className="pt-6 pb-16 sm:pb-20 lg:pb-24">
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
        <WorkFilter items={items} />
      </Container>
    </div>
  );
}

