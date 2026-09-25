import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProjectMark } from "@/components/ui/project-mark";
import {
  getProjectsByTier,
  upcomingWork,
  type Project,
  type WorkListItem,
} from "@/content/projects";
import { getPostsForProject } from "@/content/posts";
import { site } from "@/content/site";

/**
 * Selected work, in three tiers.
 *
 * The hierarchy is the point of this section: one flagship platform with its
 * connected subsystems, then featured client work, then an editorial list of
 * everything else. Three visual weights rather than three identical cards.
 */
export function FeaturedWork() {
  const flagship = getProjectsByTier("flagship");
  const featured = getProjectsByTier("featured");
  const secondary = getProjectsByTier("secondary");

  return (
    <section id="work" aria-label="Selected work" className="border-b border-border py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Selected Work"
            title="Real systems, not tutorials."
            description="An operations platform running a live production line, the label-printing workstation built beside it, a production business website, a live AI research assistant, and native iOS and web products of my own. Every screenshot is the real application."
          />
          <Link
            href={site.workHref}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            All projects <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-14 flex flex-col gap-20 lg:mt-20 lg:gap-28">
          {flagship.map((project) => (
            <Flagship key={project.slug} project={project} />
          ))}

          {featured.map((project) => (
            <Featured key={project.slug} project={project} />
          ))}

          {(secondary.length > 0 || upcomingWork.length > 0) && (
            <SecondaryList projects={secondary} upcoming={upcomingWork} />
          )}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/** "University project" / "Personal project", or null for professional work. */
function kindLabel(project: Project): string | null {
  if (project.kind === "university-project") return "University project";
  if (project.kind === "personal-project") return "Personal project";
  return null;
}

function statusSummary(project: Project) {
  const live = project.status?.filter((s) => s.state === "implemented").map((s) => s.label) ?? [];
  const built = project.status?.filter((s) => s.state === "available").map((s) => s.label) ?? [];
  return { live, built };
}

/**
 * The flagship block.
 *
 * Seven columns of copy beside a five-column visual that is built from the
 * project's own data: its mark, the path a unit takes through it, and the
 * subsystems connected to it. Beneath it sits the project's preview screenshot,
 * which for a confidential system is captured on synthetic demo data only.
 * No figure is shown that the case study does not already state.
 */
function Flagship({ project }: { project: Project }) {
  const { live, built } = statusSummary(project);
  const writing = getPostsForProject(project.slug);
  const href = `/work/${project.slug}`;

  return (
    <Reveal>
      <article aria-labelledby={`work-${project.slug}`} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            <span className="text-accent">Flagship</span>
            <span aria-hidden="true">/</span>
            <span>{project.period}</span>
            {project.confidential ? (
              <>
                <span aria-hidden="true">/</span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={11} /> NDA-safe overview
                </span>
              </>
            ) : null}
          </p>

          <h3 id={`work-${project.slug}`} className="mt-5 text-display-sm font-semibold text-text">
            <Link href={href} className="transition-colors hover:text-accent-strong">
              {project.name}
            </Link>
          </h3>
          <p className="mt-2 text-base text-text-muted">{project.fullName}</p>

          {/*
            The summary carries every fact the tagline does and more, so it is
            the one paragraph here. The tagline is the case study's headline.
          */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg sm:leading-relaxed">
            {project.summary}
          </p>

          <dl className="mt-8 grid max-w-xl grid-cols-1 gap-x-8 gap-y-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">Role</dt>
              <dd className="mt-1.5 text-sm text-text">{project.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">Built with</dt>
              <dd className="mt-1.5 text-sm text-text">{project.tech.slice(0, 6).join(", ")}</dd>
            </div>
            {live.length > 0 ? (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">Live in production</dt>
                <dd className="mt-1.5 text-sm text-text">{live.join(", ")}</dd>
              </div>
            ) : null}
            {built.length > 0 ? (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">Built, not yet live</dt>
                <dd className="mt-1.5 text-sm text-text">{built.join(", ")}</dd>
              </div>
            ) : null}
          </dl>

          {project.facts && project.facts.length > 0 ? (
            <ul className="mt-8 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
              {project.facts.map((fact) => (
                <li key={fact.label} className="bg-bg-elevated px-4 py-3">
                  <span className="block text-2xl font-semibold tracking-tight text-text">{fact.value}</span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
                    {fact.label}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-medium text-text transition-colors hover:text-accent-strong"
            >
              View Overview <ArrowRight size={15} />
            </Link>
            <Link
              href={`${href}/case-study`}
              className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
            >
              Full case study <ArrowRight size={15} />
            </Link>
            {writing.length > 0 ? (
              <span className="text-sm text-text-faint">
                {writing.length} {writing.length === 1 ? "article" : "articles"} from this work
              </span>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-6">
          <FlagshipVisual project={project} />
        </div>

        {project.previewFigure ? (
          <figure className="lg:col-span-12">
            <Link
              href={`${href}/case-study`}
              aria-label={`${project.name} full case study`}
              className="group block overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
            >
              <Image
                src={project.previewFigure.src}
                alt={project.previewFigure.alt}
                width={project.previewFigure.width}
                height={project.previewFigure.height}
                sizes="(min-width: 1216px) 1152px, 100vw"
                className="h-auto w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.01]"
              />
            </Link>
            <figcaption className="mt-3 font-mono text-xs leading-relaxed text-text-faint">
              {project.previewFigure.caption}
            </figcaption>
          </figure>
        ) : null}
      </article>
    </Reveal>
  );
}

/**
 * The visual area for a confidential system: the mark, the flow a unit takes
 * through it, and the connected subsystems. All of it is data the case study
 * already publishes, laid out rather than screenshotted.
 */
function FlagshipVisual({ project }: { project: Project }) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-bg-elevated p-7 shadow-[var(--shadow-card)] sm:p-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-accent-soft blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-4">
        <ProjectMark
          project={project}
          width={240}
          height={80}
          className="h-14 w-auto object-contain object-left sm:h-[4.5rem]"
          fallbackClassName="font-mono text-2xl font-semibold tracking-tight text-text"
        />
        {project.ecosystem ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            {project.ecosystem.label}
          </span>
        ) : null}
      </div>

      {project.workflow.length > 0 ? (
        <ol className="relative mt-12 flex flex-col gap-0" aria-label="How a unit moves through the system">
          {project.workflow.map((step, i) => (
            <li key={step} className="flex items-stretch gap-5">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border-strong bg-bg font-mono text-[10px] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < project.workflow.length - 1 ? (
                  <span aria-hidden="true" className="w-px flex-1 bg-border-strong" />
                ) : null}
              </div>
              <span className="pb-5 pt-1 text-[15px] text-text sm:text-base">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {project.ecosystem ? (
        <div className="relative mt-8 border-t border-border pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            Connected systems
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {project.ecosystem.systems.map((system) => (
              <li key={system.name} className="rounded-md border border-border bg-bg/60 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-text">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {system.slug || system.href ? (
                    <Link
                      href={system.slug ? `/work/${system.slug}` : system.href!}
                      className="transition-colors hover:text-accent-strong"
                    >
                      {system.name}
                    </Link>
                  ) : (
                    system.name
                  )}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
                  {system.relation}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-text-faint">
                  {system.summary ?? `${system.relation} of ${project.name}. Write-up to follow.`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A featured project. Same shape as the flagship at a smaller scale, with the
 * visual on the left so the two blocks alternate rather than stack alike.
 */
function Featured({ project }: { project: Project }) {
  const href = `/work/${project.slug}`;
  const live = project.links?.find((l) => l.external);

  return (
    <Reveal>
      <article aria-labelledby={`work-${project.slug}`} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div
          className={`order-2 lg:order-1 lg:col-span-6 ${project.previewFigure ? "lg:flex lg:items-center" : ""}`}
        >
          {/*
            A surface rather than a card: no border, no shadow, the mark at a
            scale that reads as the project's identity rather than a favicon.
          */}
          {project.previewFigure ? (
            <Link
              href={href}
              aria-label={`${project.name} overview`}
              className="group block w-full overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
            >
              <Image
                src={project.previewFigure.src}
                alt={project.previewFigure.alt}
                width={project.previewFigure.width}
                height={project.previewFigure.height}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="h-auto w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.015]"
              />
            </Link>
          ) : (
            <div className="relative flex h-full min-h-64 items-center justify-center overflow-hidden rounded-lg bg-bg-elevated p-10 sm:min-h-80">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-soft blur-3xl"
              />
              <ProjectMark
                project={project}
                width={360}
                height={210}
                className="relative h-28 w-auto object-contain sm:h-40"
                fallbackClassName="relative font-mono text-3xl font-semibold tracking-tight text-text"
              />
            </div>
          )}
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            <span className="text-accent">Featured</span>
            <span aria-hidden="true">/</span>
            <span>{project.period}</span>
            <span aria-hidden="true">/</span>
            <span>{project.affiliation}</span>
          </p>

          <h3 id={`work-${project.slug}`} className="mt-5 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            <Link href={href} className="transition-colors hover:text-accent-strong">
              {project.name}
            </Link>
          </h3>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">{project.tagline}</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">{project.summary}</p>

          <dl className="mt-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">Role</dt>
              <dd className="mt-1.5 text-sm text-text">{project.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">Built with</dt>
              <dd className="mt-1.5 text-sm text-text">{project.tech.slice(0, 5).join(", ")}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-medium text-text transition-colors hover:text-accent-strong"
            >
              View Overview <ArrowRight size={15} />
            </Link>
            {live ? (
              <a
                href={live.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
              >
                {live.label} <ArrowUpRight size={14} />
              </a>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Everything else, as rows.
 *
 * A project with a case study gets its tagline, meta and links. A project with
 * only a name is listed by name and says a write-up is to follow, which is the
 * truth, rather than being padded with a sentence nobody verified.
 */
function SecondaryList({ projects, upcoming }: { projects: Project[]; upcoming: WorkListItem[] }) {
  return (
    <Reveal>
      <div className="border-t border-border">
        <p className="pt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
          Other work
        </p>
        <ul className="mt-2 divide-y divide-border">
          {projects.map((project) => {
            const href = `/work/${project.slug}`;
            const external = project.links?.filter((l) => l.external) ?? [];
            return (
              <li key={project.slug} className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:gap-6">
                <div className="sm:col-span-3">
                  <h3 className="text-lg font-semibold tracking-tight text-text">
                    <Link href={href} className="transition-colors hover:text-accent-strong">
                      {project.name}
                    </Link>
                  </h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
                    {kindLabel(project) ?? project.affiliation}
                    <span aria-hidden="true"> · </span>
                    {project.period}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-text-muted sm:col-span-6">{project.tagline}</p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-3 sm:justify-end">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-sm text-text transition-colors hover:text-accent-strong"
                  >
                    Overview <ArrowRight size={13} />
                  </Link>
                  {external.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
                    >
                      {link.label.replace(" on GitHub", "")} <ArrowUpRight size={13} />
                    </a>
                  ))}
                </div>
              </li>
            );
          })}

          {upcoming.map((item) => (
            <li key={item.name} className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:gap-6">
              <div className="sm:col-span-3">
                <h3 className="text-lg font-semibold tracking-tight text-text">
                  {item.href ? (
                    item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-accent-strong"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link href={item.href} className="transition-colors hover:text-accent-strong">
                        {item.name}
                      </Link>
                    )
                  ) : (
                    item.name
                  )}
                </h3>
                {item.meta ? (
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed text-text-faint sm:col-span-6">
                {item.summary ?? "Write-up to follow."}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
