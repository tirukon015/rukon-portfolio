/**
 * Core type definitions for the Confidentiality & Anonymization Engine.
 */

export type ConfidentialClassification =
  | "company"
  | "client"
  | "project"
  | "product"
  | "hardware"
  | "asset"
  | "document";

export interface ConfidentialEntity {
  id: string;
  original: string;
  publicAlternative: string;
  classification: ConfidentialClassification;
  /** Contextual guidance describing when to anonymize vs retain */
  contextNote?: string;
  /** Exact regex patterns used for text scanning and sanitization */
  patterns?: RegExp[];
}

export interface ProjectSlugMapping {
  originalSlug: string;
  publicSlug: string;
}

export interface ConfidentialityContext {
  isAuthorized: boolean;
  isAdmin?: boolean;
}
