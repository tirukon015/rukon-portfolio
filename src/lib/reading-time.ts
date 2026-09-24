import { sectionsText, type PostSection } from "@/content/posts";

/**
 * Estimates reading time from post body text, so it's derived from the
 * actual content instead of being hand-typed (and drifting) per post.
 */
export function estimateReadingTime(sections: PostSection[]): string {
  const words = sectionsText(sections).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
