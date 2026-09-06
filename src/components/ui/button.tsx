import Link from "next/link";
import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const styles: Record<NonNullable<BaseProps["variant"]>, string> = {
  primary:
    "bg-accent text-accent-contrast hover:bg-accent-strong shadow-[0_0_0_1px_var(--color-accent-soft)]",
  secondary:
    "border border-border-strong text-text hover:border-accent hover:text-accent-strong",
  ghost: "text-text-muted hover:text-text",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent";

/**
 * The same pill as `ButtonLink`, as a real `<button>`.
 *
 * Added because the CV access flow needs an in-page action rather than a
 * navigation. It shares `base` and `styles` with the link version so the two
 * cannot drift apart visually.
 */
export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(base, styles[variant], "disabled:opacity-60", className)}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external,
  download,
}: BaseProps & { href: string; external?: boolean; download?: string | boolean }) {
  const cls = cn(base, styles[variant], className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        download={download}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} download={download}>
      {children}
    </Link>
  );
}
