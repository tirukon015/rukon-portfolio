export type Capability = {
  title: string;
  description: string;
};

export const capabilities: Capability[] = [
  {
    title: "IT Systems & Operations",
    description: "Managing and supporting software systems and the operational processes around them.",
  },
  {
    title: "Business Systems",
    description: "Building and maintaining internal systems that support real business workflows.",
  },
  {
    title: "Production & Inventory Systems",
    description: "Working with production and inventory processes through software and operational systems.",
  },
  {
    title: "Full-Stack Web Development",
    description: "Building modern web applications and websites.",
  },
  {
    title: "UI/UX + Web Development",
    description: "Designing interfaces in Figma and translating them into working websites.",
  },
  {
    title: "Business Process Automation",
    description: "Turning repetitive, manual workflows into structured digital processes.",
  },
  {
    title: "IT Infrastructure & Support",
    description:
      "Technical support, system configuration, troubleshooting, and hardware and software support.",
  },
];

export type StackCategory = {
  category: string;
  items: string[];
};

export const stack: StackCategory[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Next.js API Routes", "REST APIs"],
  },
  {
    category: "Database",
    items: ["PostgreSQL", "MySQL"],
  },
  {
    category: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "C", "C++"],
  },
  {
    category: "Design",
    items: ["Figma"],
  },
  {
    category: "Tools & CMS",
    items: ["Git / GitHub", "WordPress", "Elementor", "WooCommerce"],
  },
  {
    category: "Deployment & Infrastructure",
    items: ["Vercel", "Supabase", "cPanel"],
  },
];
