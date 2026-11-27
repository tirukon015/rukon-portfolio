import type { ProjectCategory, ProjectCategorySlug } from "./projects";

/**
 * Work categories. Kept apart from `projects.ts` so client components (the
 * /work filter) can import them without pulling project data into the browser
 * bundle. `projects.ts` is server-only.
 */
export type ProjectCategoryInfo = {
  name: ProjectCategory;
  slug: ProjectCategorySlug | "all";
  label: string;
  description: string;
};

export const projectCategories: ProjectCategoryInfo[] = [
  {
    name: "Systems / ERP / WMS",
    slug: "systems",
    label: "Systems / ERP / WMS",
    description: "Operational platforms, warehouse & manufacturing logic, automation, and real-world workflow systems.",
  },
  {
    name: "Web Apps / Software",
    slug: "web-apps",
    label: "Web Apps / Software",
    description: "Full-stack software applications, API integrations, data isolation, and AI-assisted workflows.",
  },
  {
    name: "Websites",
    slug: "websites",
    label: "Websites",
    description: "High-performance production websites, design-to-code implementations, and technical SEO.",
  },
  {
    name: "iOS / Mobile",
    slug: "ios-mobile",
    label: "iOS / Mobile",
    description: "Native mobile applications, on-device intelligence, and offline-first mobile tools.",
  },
];
