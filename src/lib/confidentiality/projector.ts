import type { Project, CaseStudySection, CaseStudyFigure, HROverview, ProjectStatusItem, RelatedSystem } from "@/content/projects";
import type { ExperienceEntry } from "@/content/experience";
import type { BlogPost, PostSection } from "@/content/posts/types";
import type { FaqItem } from "@/content/faq";
import { getPublicSlug, PROJECT_SLUG_MAPPINGS } from "./registry";

/**
 * Centralized Projection Engine.
 *
 * Implements context-aware projection of confidential identities
 * across all site content layers.
 */

interface SanitizeOptions {
  preserveGenericHardware?: boolean;
}

/**
 * Sanitizes arbitrary text blocks with context awareness.
 */
export function sanitizeText(text: string, options: SanitizeOptions = {}): string {
  if (!text) return "";

  let result = text;

  // 1. URLs and Project Slugs first to avoid partial string replacements
  for (const [origSlug, pubSlug] of Object.entries(PROJECT_SLUG_MAPPINGS)) {
    result = result.replace(new RegExp(`/work/${origSlug}(?=[/\\s)"'\`]|$)`, "g"), `/work/${pubSlug}`);
  }

  // 2. Specific Compound & Programme Names
  result = result.replace(
    /Blue Bee Technologies\s*(?:Sdn\.\s*Bhd\.)?\s*,\s*ERTH\s*[×x]\s*Maxis\s*programme/gi,
    "Enterprise Systems & Refurbishment Programme"
  );
  result = result.replace(
    /Blue Bee Technologies\s*[×x]\s*ERTH\s*[×x]\s*Maxis\s*programme/gi,
    "Enterprise Device Circularity Programme"
  );
  result = result.replace(
    /ERTH\s*[×x]\s*Maxis\s*refurbishment\s*line/gi,
    "National Device Circularity Refurbishment Line"
  );
  result = result.replace(
    /ERTH\s*[×x]\s*Maxis\s*programme/gi,
    "National Device Circularity Programme"
  );

  // 3. Exact Company Identities
  result = result.replace(
    /Blue Bee Technologies\s+Sdn\.\s*Bhd\./gi,
    "Established Malaysian technology company"
  );
  result = result.replace(
    /Blue Bee Technologies/gi,
    "Established Malaysian technology company"
  );
  result = result.replace(
    /\bBBTech's\b/gi,
    "the technology company's"
  );
  result = result.replace(
    /\bBBTech\b/gi,
    "Established Malaysian technology company"
  );
  result = result.replace(
    /rpoms\.bbtech\.com\.my/gi,
    "rpoms.internal-domain.com"
  );
  result = result.replace(
    /bbtech\.com\.my/gi,
    "internal-domain.com"
  );

  result = result.replace(
    /ERTH\s*\(e-waste collection and recycling,\s*Malaysia\)/gi,
    "Malaysia's No. 1 E-Waste Recycling Company"
  );
  result = result.replace(
    /ERTH Router Retest & Cleaning Operations Management System/gi,
    "Telco Device Operations & Quality System"
  );
  result = result.replace(
    /ERTH Router Retest & Cleaning Operations/gi,
    "Telco Device Operations & Quality System"
  );
  result = result.replace(
    /ERTH Router Retest & Distribution/gi,
    "Telco Device Operations & Quality System"
  );
  result = result.replace(
    /warehouse\s+ERTH/gi,
    "Central Circularity Warehouse"
  );
  result = result.replace(
    /\bERTH\b/g,
    "Malaysia's No. 1 E-Waste Recycling Company"
  );

  result = result.replace(
    /\bMaxis\b/g,
    "Leading Malaysian telecommunications provider"
  );

  // 4. Project & System Tool Names with Confidential Business Affiliation
  result = result.replace(
    /BBTech Laptop Tool/gi,
    "Laptop QC & SMBIOS Tool"
  );
  result = result.replace(
    /BBTech Laptop Inspection Tool/gi,
    "Laptop Driver Inspection & Repair Tool"
  );
  result = result.replace(
    /WiFi Router Diagnostic Tool/gi,
    "Multi-Vendor Network Hardware Diagnostic Tool"
  );

  // 5. Context-aware Hardware Models
  if (!options.preserveGenericHardware) {
    result = result.replace(
      /KAON\s+Broadband\s+\(AR2140\)/gi,
      "Enterprise Dual-Band Wi-Fi 6 Gateway"
    );
    result = result.replace(
      /Kaon\s+AR2140/gi,
      "Enterprise Dual-Band Wi-Fi 6 Gateway"
    );
    result = result.replace(
      /\bKAON2140\b/g,
      "GW2140"
    );
    result = result.replace(
      /Huawei\s+EchoLife\s*\/\s*OptiXstar\s+ONTs/gi,
      "Enterprise Optical Network Terminals (ONTs)"
    );
    result = result.replace(
      /Huawei\s+EchoLife/gi,
      "Enterprise Optical Network Terminal"
    );
    result = result.replace(
      /TP-Link\s+\(EX510,\s*Archer\s+AX20\)/gi,
      "Enterprise Dual-Band Gigabit Wi-Fi Router"
    );
    result = result.replace(
      /TP-Link\s+EX510/gi,
      "Enterprise Gigabit Wi-Fi Router"
    );
  }

  return result;
}

/**
 * Projects a single project definition into public or authorized representation.
 */
export function projectProject(project: Project, isAuthorized: boolean): Project {
  if (isAuthorized) {
    return { ...project };
  }

  const publicSlug = getPublicSlug(project.slug);

  const sanitizedHrOverview: HROverview = {
    ...project.hrOverview,
    valueProposition: sanitizeText(project.hrOverview.valueProposition),
    role: project.hrOverview.role,
    roleScope: project.hrOverview.roleScope ? sanitizeText(project.hrOverview.roleScope) : undefined,
    context: sanitizeText(project.hrOverview.context),
    highlights: project.hrOverview.highlights.map((h) => sanitizeText(h)),
    technologies: project.hrOverview.technologies,
  };

  const sanitizedSections: CaseStudySection[] = project.sections.map((sec) => ({
    heading: sanitizeText(sec.heading),
    body: sec.body.map((b) => sanitizeText(b)),
    note: sec.note ? sanitizeText(sec.note) : undefined,
    figures: sec.figures?.map((fig) => sanitizeFigure(fig)),
  }));

  const sanitizedStatus: ProjectStatusItem[] | undefined = project.status?.map((st) => ({
    ...st,
    label: sanitizeText(st.label),
    detail: sanitizeText(st.detail),
  }));

  const sanitizedEcosystem = project.ecosystem
    ? {
        label: sanitizeText(project.ecosystem.label),
        systems: project.ecosystem.systems.map(
          (sys): RelatedSystem => ({
            name: sanitizeText(sys.name),
            relation: sanitizeText(sys.relation),
            summary: sys.summary ? sanitizeText(sys.summary) : undefined,
            slug: sys.slug ? getPublicSlug(sys.slug) : undefined,
            href: sys.href ? sanitizeText(sys.href) : undefined,
          })
        ),
      }
    : undefined;

  let publicName = project.name;
  let publicFullName = project.fullName;

  // Authentic project names (RPOMS, RPOMS Print Engine, RPOMS AI, ITMS) remain untouched.
  // Only business names (ERTH, BBTech) in titles are sanitized.
  if (project.slug === "erth") {
    publicName = "National E-Waste Circularity Platform";
    publicFullName = "National E-Waste Circularity Platform: technical SEO and web implementation";
  } else if (project.slug === "bbtech-laptop-tool") {
    publicName = "Laptop QC & SMBIOS Tool";
    publicFullName = "Laptop QC & SMBIOS Tool: Portable Hardware QC & Refurbishment Audit";
  } else if (project.slug === "bbtech-laptop-inspection-tool") {
    publicName = "Automated Laptop Driver Inspection & Repair Tool";
    publicFullName = "Automated Laptop Driver Inspection & Repair Tool: driver inspection and official-source repair";
  } else if (project.slug === "router-diagnostic") {
    publicName = "Multi-Vendor Network Hardware Diagnostic Tool";
    publicFullName = "Multi-Vendor Network Hardware Diagnostic Tool: Telco Recovery & LAN Serial Extraction";
  } else if (project.slug === "erth-router-distribution") {
    publicName = "Router Retest & Distribution Operations System";
    publicFullName = "Router Retest & Distribution Operations Management System";
  }

  // Sanitize full name for any business references (e.g. BBTech's)
  publicFullName = sanitizeText(publicFullName);

  // Preserve authentic project marks and logos for software credibility with sanitized alt text
  const publicImage = project.image
    ? {
        ...project.image,
        alt: sanitizeText(project.image.alt),
      }
    : undefined;

  return {
    ...project,
    slug: publicSlug,
    name: publicName,
    fullName: publicFullName,
    tagline: sanitizeText(project.tagline),
    summary: sanitizeText(project.summary),
    hrOverview: sanitizedHrOverview,
    roleScope: project.roleScope ? sanitizeText(project.roleScope) : undefined,
    affiliation: sanitizeText(project.affiliation),
    tech: project.tech.map((t) => sanitizeText(t)),
    techGroups: project.techGroups?.map((group) => ({
      label: sanitizeText(group.label),
      items: group.items.map((item) => sanitizeText(item)),
    })),
    highlights: project.highlights.map((h) => sanitizeText(h)),
    workflow: project.workflow.map((w) => sanitizeText(w)),
    sections: sanitizedSections,
    status: sanitizedStatus,
    limitations: project.limitations?.map((l) => sanitizeText(l)),
    roadmap: project.roadmap?.map((r) => sanitizeText(r)),
    confidentialNotice: project.confidentialNotice
      ? sanitizeText(project.confidentialNotice)
      : undefined,
    ecosystem: sanitizedEcosystem,
    previewFigure: project.previewFigure ? sanitizeFigure(project.previewFigure) : undefined,
    image: publicImage,
    shareImage: project.shareImage
      ? {
          ...project.shareImage,
          src: project.shareImage.src,
          alt: sanitizeText(project.shareImage.alt),
        }
      : undefined,
    links: project.links?.map((link) => ({
      ...link,
      label: sanitizeText(link.label),
      href: sanitizeText(link.href),
    })),
    facts: project.facts?.map((f) => ({
      label: sanitizeText(f.label),
      value: sanitizeText(f.value),
    })),
  };
}

function sanitizeFigure(figure: CaseStudyFigure): CaseStudyFigure {
  return {
    ...figure,
    alt: sanitizeText(figure.alt),
    caption: sanitizeText(figure.caption),
  };
}

/**
 * Projects experience entries into public or authorized representation.
 */
export function projectExperience(
  entries: ExperienceEntry[],
  isAuthorized: boolean
): ExperienceEntry[] {
  if (isAuthorized) return entries;

  return entries.map((entry) => ({
    ...entry,
    org: sanitizeText(entry.org),
    summary: sanitizeText(entry.summary),
    bullets: entry.bullets.map((b) => sanitizeText(b)),
    projects: entry.projects?.map((slug) => getPublicSlug(slug)),
  }));
}

/**
 * Projects a single blog post into public or authorized representation.
 */
export function projectBlogPost(post: BlogPost, isAuthorized: boolean): BlogPost {
  if (isAuthorized) return post;

  const isHardwareProtocolArticle = post.slug === "lan-serial-number-extraction-across-router-vendors";

  const sanitizeSection = (sec: PostSection): PostSection => {
    return {
      heading: sanitizeText(sec.heading),
      body: sec.body.map((block) => {
        if (typeof block === "string") {
          return sanitizeText(block, { preserveGenericHardware: isHardwareProtocolArticle });
        }
        if (block.type === "flow") {
          return {
            ...block,
            steps: block.steps.map((s) => sanitizeText(s)),
            caption: block.caption ? sanitizeText(block.caption) : undefined,
          };
        }
        if (block.type === "table") {
          return {
            ...block,
            head: block.head.map((h) => sanitizeText(h)),
            rows: block.rows.map((row) =>
              row.map((cell) => sanitizeText(cell, { preserveGenericHardware: isHardwareProtocolArticle }))
            ),
            caption: block.caption ? sanitizeText(block.caption) : undefined,
          };
        }
        if (block.type === "callout") {
          return {
            ...block,
            label: block.label ? sanitizeText(block.label) : undefined,
            text: sanitizeText(block.text),
          };
        }
        if (block.type === "list") {
          return {
            ...block,
            items: block.items.map((item) => sanitizeText(item)),
          };
        }
        if (block.type === "image") {
          return {
            ...block,
            caption: block.caption ? sanitizeText(block.caption) : undefined,
            alt: sanitizeText(block.alt),
          };
        }
        if (block.type === "code") {
          return {
            ...block,
            caption: block.caption ? sanitizeText(block.caption) : undefined,
            code: block.code
              .replace(/rpoms\.bbtech\.com\.my/gi, "rpoms.internal-domain.com")
              .replace(/bbtech\.com\.my/gi, "internal-domain.com")
              .replace(/BBTECH_STOREROOM/g, "ENTERPRISE_STOREROOM")
              .replace(/bbtechStoreroom/g, "enterpriseStoreroom")
              .replace(/\\\/bbtech\\\//g, "\\/internal\\/")
              .replace(/\/bbtech\//g, "/internal/")
              .replace(/\bBBTech\b/g, "EnterpriseOrg")
              .replace(/Blue Bee Technologies/gi, "Enterprise Org"),
          };
        }
        return block;
      }),
    };
  };

  return {
    ...post,
    title: sanitizeText(post.title),
    description: sanitizeText(post.description),
    seoTitle: post.seoTitle ? sanitizeText(post.seoTitle) : undefined,
    tags: post.tags.map((t) => sanitizeText(t)),
    relatedProjects: post.relatedProjects?.map((slug) => getPublicSlug(slug)),
    related: post.related?.map((link) => ({
      label: sanitizeText(link.label),
      href: sanitizeText(link.href),
    })),
    sections: post.sections.map((sec) => sanitizeSection(sec)),
  };
}

/**
 * Projects FAQ items.
 */
export function projectFaqs(faqs: FaqItem[], isAuthorized: boolean): FaqItem[] {
  if (isAuthorized) return faqs;

  return faqs.map((f) => ({
    question: sanitizeText(f.question),
    answer: sanitizeText(f.answer),
  }));
}
