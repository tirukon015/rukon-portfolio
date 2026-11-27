import "server-only";
import type { ConfidentialEntity } from "./types";

/**
 * Authoritative Centralized Confidentiality Registry.
 *
 * Keeps original identities untouched in private records while providing
 * typed, context-aware public alternatives across the entire site.
 */

export const PROJECT_SLUG_MAPPINGS: Record<string, string> = {
  rpoms: "rpoms",
  "rpoms-print-engine": "rpoms-print-engine",
  "rpoms-ai": "rpoms-ai",
  itms: "itms",
  "bbtech-laptop-tool": "laptop-qc-tool",
  "bbtech-laptop-inspection-tool": "driver-inspection-tool",
  "erth-router-distribution": "router-retest-distribution",
  erth: "e-waste-circularity-platform",
};

export const REVERSE_PROJECT_SLUG_MAPPINGS: Record<string, string> = Object.entries(
  PROJECT_SLUG_MAPPINGS
).reduce<Record<string, string>>((acc, [orig, pub]) => {
  acc[pub] = orig;
  return acc;
}, {});

export function getPublicSlug(originalSlug: string): string {
  return PROJECT_SLUG_MAPPINGS[originalSlug] ?? originalSlug;
}

export function getOriginalSlug(slug: string): string {
  if (slug === "enterprise-device-operations") return "rpoms";
  if (slug === "device-print-engine") return "rpoms-print-engine";
  if (slug === "device-vision-grading") return "rpoms-ai";
  if (slug === "asset-inventory-management") return "itms";
  if (slug === "hardware-qc-tool") return "bbtech-laptop-tool";
  if (slug === "device-operations-cleaning") return "erth-router-distribution";
  return REVERSE_PROJECT_SLUG_MAPPINGS[slug] ?? slug;
}

export const ENTITY_REGISTRY: Record<string, ConfidentialEntity> = {
  // Companies & Employers
  blue_bee: {
    id: "blue_bee",
    original: "Blue Bee Technologies Sdn. Bhd.",
    publicAlternative: "Established Malaysian technology company",
    classification: "company",
    contextNote: "Direct employer identity across all experience and project mentions",
    patterns: [
      /\bBlue Bee Technologies Sdn\. Bhd\./g,
      /\bBlue Bee Technologies\b/g,
      /\bBBTech\b/g,
    ],
  },
  erth: {
    id: "erth",
    original: "ERTH",
    publicAlternative: "Malaysia's No. 1 E-Waste Recycling Company",
    classification: "company",
    contextNote: "E-waste collection and recycling enterprise partner",
    patterns: [
      /\bERTH \(e-waste collection and recycling, Malaysia\)/g,
      /\bERTH\b/g,
    ],
  },
  maxis: {
    id: "maxis",
    original: "Maxis",
    publicAlternative: "Leading Malaysian telecommunications provider",
    classification: "client",
    contextNote: "Telecommunications partner in the device refurbishment programme",
    patterns: [
      /\bMaxis\b/g,
    ],
  },

  // Projects & Systems (Kept authentic to preserve engineering credibility)
  rpoms: {
    id: "rpoms",
    original: "RPOMS",
    publicAlternative: "RPOMS",
    classification: "project",
    contextNote: "Authentic project acronym and software IP",
    patterns: [
      /\bRPOMS\b/g,
    ],
  },
  rpoms_print_engine: {
    id: "rpoms_print_engine",
    original: "RPOMS Print Engine",
    publicAlternative: "RPOMS Print Engine",
    classification: "project",
    patterns: [
      /\bRPOMS Print Engine\b/g,
    ],
  },
  rpoms_ai: {
    id: "rpoms_ai",
    original: "RPOMS AI",
    publicAlternative: "RPOMS AI",
    classification: "project",
    patterns: [
      /\bRPOMS AI\b/g,
    ],
  },
  itms: {
    id: "itms",
    original: "ITMS",
    publicAlternative: "ITMS",
    classification: "project",
    patterns: [
      /\bITMS\b/g,
    ],
  },
  bbtech_laptop_tool: {
    id: "bbtech_laptop_tool",
    original: "BBTech Laptop Tool",
    publicAlternative: "Hardware QC & SMBIOS Audit Utility",
    classification: "project",
    patterns: [
      /\bBBTech Laptop Tool\b/g,
    ],
  },
  bbtech_laptop_inspection_tool: {
    id: "bbtech_laptop_inspection_tool",
    original: "BBTech Laptop Inspection Tool",
    publicAlternative: "Automated Device Driver Inspection & Repair Tool",
    classification: "project",
    patterns: [
      /\bBBTech Laptop Inspection Tool\b/g,
    ],
  },
  router_diagnostic: {
    id: "router_diagnostic",
    original: "WiFi Router Diagnostic Tool",
    publicAlternative: "Multi-Vendor Network Hardware Diagnostic Tool",
    classification: "project",
    patterns: [
      /\bWiFi Router Diagnostic Tool\b/g,
    ],
  },
  erth_router_distribution: {
    id: "erth_router_distribution",
    original: "ERTH Router Retest & Distribution",
    publicAlternative: "Telco Device Operations & Quality System",
    classification: "project",
    patterns: [
      /\bERTH Router Retest & Cleaning Operations Management System\b/g,
      /\bERTH Router Retest & Distribution\b/g,
      /\bERTH Router Retest & Cleaning Operations\b/g,
    ],
  },

  // Context-aware Hardware & Product Models
  kaon_ar2140: {
    id: "kaon_ar2140",
    original: "Kaon AR2140",
    publicAlternative: "Enterprise Dual-Band Wi-Fi 6 Gateway",
    classification: "hardware",
    contextNote:
      "When associated with client refurbishment contracts or serial boxes; generic UPnP protocol discussions preserve technical references without client links",
    patterns: [
      /\bKAON Broadband \(AR2140\)/g,
      /\bKaon AR2140\b/g,
      /\bKAON2140\b/g,
      /\bAR2140\b/g,
    ],
  },
  huawei_ont: {
    id: "huawei_ont",
    original: "Huawei EchoLife / OptiXstar",
    publicAlternative: "Enterprise Optical Network Terminal (ONT)",
    classification: "hardware",
    contextNote: "Refurbished GPON ONT client fleet",
    patterns: [
      /\bHuawei EchoLife \/ OptiXstar ONTs\b/g,
      /\bHuawei EchoLife\b/g,
      /\bOptiXstar\b/g,
    ],
  },
  tplink_ex510: {
    id: "tplink_ex510",
    original: "TP-Link EX510",
    publicAlternative: "High-Performance Dual-Band Gigabit Wi-Fi Router",
    classification: "hardware",
    contextNote: "Client Wi-Fi router fleet",
    patterns: [
      /\bTP-Link \(EX510, Archer AX20\)/g,
      /\bTP-Link EX510\b/g,
      /\bEX510\b/g,
    ],
  },
};
