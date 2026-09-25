"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { HRProjectCard } from "@/components/work/hr-project-card";
import { UpcomingProjectCard } from "@/components/work/upcoming-project-card";
import {
  projectCategories,
  type Project,
  type UpcomingProject,
  type ProjectCategorySlug,
} from "@/content/projects";

type WorkFilterProps = {
  projects: Project[];
  upcomingProjects: UpcomingProject[];
  postCountsByProject: Record<string, number>;
};

export function WorkFilter({
  projects,
  upcomingProjects,
  postCountsByProject,
}: WorkFilterProps) {
  const [activeSlug, setActiveSlug] = useState<ProjectCategorySlug | "all">("all");

  // Determine items matching active category
  const activeCategoryInfo = projectCategories.find((c) => c.slug === activeSlug);

  const filteredProjects = projects.filter((p) => {
    if (activeSlug === "all") return true;
    const cat = projectCategories.find((c) => c.slug === activeSlug);
    if (!cat) return true;
    return p.categorySlug === activeSlug || p.categories.includes(cat.name);
  });

  const filteredUpcoming = upcomingProjects.filter((p) => {
    if (activeSlug === "all") return true;
    const cat = projectCategories.find((c) => c.slug === activeSlug);
    if (!cat) return true;
    return p.categorySlug === activeSlug || p.categories.includes(cat.name);
  });

  // Category counts
  const getCategoryCount = (slug: ProjectCategorySlug | "all") => {
    if (slug === "all") return projects.length + upcomingProjects.length;
    const cat = projectCategories.find((c) => c.slug === slug);
    if (!cat) return 0;
    const pCount = projects.filter((p) => p.categorySlug === slug || p.categories.includes(cat.name)).length;
    const uCount = upcomingProjects.filter((p) => p.categorySlug === slug || p.categories.includes(cat.name)).length;
    return pCount + uCount;
  };

  return (
    <div className="mt-10">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-6" role="tablist" aria-label="Work categories">
        <button
          role="tab"
          aria-selected={activeSlug === "all"}
          onClick={() => setActiveSlug("all")}
          className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeSlug === "all"
              ? "bg-text text-bg shadow-sm"
              : "border border-border bg-bg-elevated text-text-muted hover:border-border-strong hover:text-text"
          }`}
        >
          <span>All Work</span>
          <span
            className={`rounded-full px-1.5 py-0.2 font-mono text-[11px] ${
              activeSlug === "all"
                ? "bg-bg/20 text-bg"
                : "bg-bg text-text-faint group-hover:text-text"
            }`}
          >
            {getCategoryCount("all")}
          </span>
        </button>

        {projectCategories.map((category) => {
          const count = getCategoryCount(category.slug as ProjectCategorySlug);
          const isActive = activeSlug === category.slug;

          return (
            <button
              key={category.slug}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSlug(category.slug as ProjectCategorySlug)}
              className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border bg-bg-elevated text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              <span>{category.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 font-mono text-[11px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-bg text-text-faint group-hover:text-text"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Description Banner */}
      {activeCategoryInfo && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/[0.03] px-4 py-3 text-xs sm:text-sm text-text-muted">
          <Layers size={16} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <span className="font-semibold text-text">{activeCategoryInfo.label}: </span>
            <span>{activeCategoryInfo.description}</span>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {filteredProjects.map((project, i) => (
          <Reveal key={project.slug} delayMs={i * 60}>
            <HRProjectCard
              project={project}
              articleCount={postCountsByProject[project.slug] ?? 0}
            />
          </Reveal>
        ))}

        {filteredUpcoming.map((project, i) => (
          <Reveal key={project.slug} delayMs={(filteredProjects.length + i) * 60}>
            <UpcomingProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
