import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/seo";

/**
 * Visible breadcrumb trail.
 *
 * Rendered as an ordered list inside a labelled nav so the structure is real
 * rather than implied by separators. The last crumb is the current page and is
 * marked `aria-current` instead of being linked to itself.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-faint">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-text-muted">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-accent-strong">
                  {item.name}
                </Link>
              )}
              {isLast ? null : (
                <ChevronRight size={12} aria-hidden="true" className="text-text-faint" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
