"use client";

import { useState, type ReactNode } from "react";
import { Layers } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { ProjectCategorySlug } from "@/content/projects";
import { projectCategories } from "@/content/project-categories";

/**
 * One entry in the /work grid. The card itself is rendered on the server and
 * passed in as `card`, so neither project data nor the card component ships
 * to the browser; the filter only needs each entry's categories.
 */
export type WorkFilterItem = {
  slug: string;
  categorySlug: string;
  categories: string[];
  card: ReactNode;
};

type WorkFilterProps = {
  items: WorkFilterItem[];
};

type ActiveSlug = ProjectCategorySlug | "all";

function matches(item: WorkFilterItem, slug: ActiveSlug) {
  if (slug === "all") return true;
  const cat = projectCategories.find((c) => c.slug === slug);
  if (!cat) return true;
  return item.categorySlug === slug || item.categories.includes(cat.name);
}

export function WorkFilter({ items }: WorkFilterProps) {
  const [activeSlug, setActiveSlug] = useState<ActiveSlug>("all");
  const activeCategoryInfo = projectCategories.find((c) => c.slug === activeSlug);
  const visible = items.filter((item) => matches(item, activeSlug));
  const count = (slug: ActiveSlug) => items.filter((item) => matches(item, slug)).length;

  const pill = (slug: ActiveSlug, label: string, activeClass: string, activeCountClass: string) => {
    const isActive = activeSlug === slug;
    return (
      <button
        key={slug}
        type="button"
        aria-pressed={isActive}
        onClick={() => setActiveSlug(slug)}
        className={`group inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive
            ? activeClass
            : "border border-border bg-bg-elevated text-text-muted hover:border-border-strong hover:text-text"
        }`}
      >
        <span>{label}</span>
        <span
          className={`rounded-full px-1.5 py-0.2 font-mono text-[11px] ${
            isActive ? activeCountClass : "bg-bg text-text-faint group-hover:text-text"
          }`}
        >
          {count(slug)}
        </span>
      </button>
    );
  };

  return (
    <div className="mt-10">
      {/* Category filter: toggle buttons, so the pressed state is announced. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-6" role="group" aria-label="Filter work by category">
        {pill("all", "All Work", "bg-text text-bg shadow-sm", "bg-bg/20 text-bg")}
        {projectCategories.map((category) =>
          pill(category.slug as ProjectCategorySlug, category.label, "bg-accent text-white shadow-sm", "bg-white/20 text-white")
        )}
      </div>

      {activeCategoryInfo && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/[0.03] px-4 py-3 text-xs sm:text-sm text-text-muted">
          <Layers size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <span className="font-semibold text-text">{activeCategoryInfo.label}: </span>
            <span>{activeCategoryInfo.description}</span>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {visible.map((item, i) => (
          <Reveal key={item.slug} delayMs={i * 60}>
            {item.card}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
