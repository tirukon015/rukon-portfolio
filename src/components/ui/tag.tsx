import { cn } from "@/lib/utils";

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border-strong px-3 py-1 font-mono text-xs text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
