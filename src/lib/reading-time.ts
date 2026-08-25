/**
 * Estimates reading time from post body text, so it's derived from the
 * actual content instead of being hand-typed (and drifting) per post.
 */
export function estimateReadingTime(sections: { body: string[] }[]): string {
  const words = sections
    .flatMap((s) => s.body)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
