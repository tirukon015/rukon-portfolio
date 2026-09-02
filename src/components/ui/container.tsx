import { cn } from "@/lib/utils";

/**
 * Matches an unprefixed max-width utility such as `max-w-3xl`.
 *
 * Deliberately does not match a responsive variant like `lg:max-w-4xl`: a
 * caller that only overrides the width at one breakpoint still wants the
 * default to apply below it.
 */
const HAS_MAX_WIDTH = /(?:^|\s)max-w-/;

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  /*
   * Tailwind's max-width utilities all carry the same specificity, and `cn` is
   * a plain string join with no conflict resolution. When a caller passed
   * `max-w-3xl`, both it and the default `max-w-6xl` ended up on the element,
   * and the one emitted later in the stylesheet won. That is `max-w-6xl`, so
   * every caller-supplied narrower width was silently ignored.
   *
   * The fix is to not create the conflict: the default is only emitted when the
   * caller has not supplied a width of their own. That keeps every existing
   * call site working as written, needs no `!important`, and adds no
   * class-merging dependency to a project that deliberately runs five.
   */
  const hasMaxWidth = HAS_MAX_WIDTH.test(className ?? "");

  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-8",
        !hasMaxWidth && "max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  );
}
