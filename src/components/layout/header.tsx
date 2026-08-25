"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { site, nav } from "@/content/site";
import { useActiveSection } from "@/lib/use-active-section";
import { cn } from "@/lib/utils";

const sectionIds = nav
  .map((item) => item.sectionId)
  .filter((id): id is NonNullable<typeof id> => id !== null);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-bg/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-widest text-text"
          aria-label="Home"
        >
          {site.initials}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors",
                item.sectionId && active === item.sectionId
                  ? "text-accent-strong"
                  : "text-text-muted hover:text-text"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <a
            href={site.links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-text-muted transition-colors hover:text-text"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href={site.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-text-muted transition-colors hover:text-text"
          >
            <LinkedinIcon size={18} />
          </a>
          <ThemeToggle />
          <Link
            href="/#contact"
            className="rounded-full border border-border-strong px-4 py-2 text-sm text-text transition-colors hover:border-accent hover:text-accent-strong"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="text-text"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-bg md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-2 py-3 text-base transition-colors",
                  item.sectionId && active === item.sectionId
                    ? "text-accent-strong"
                    : "text-text-muted hover:bg-bg-elevated hover:text-text"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-5 px-2 py-2">
              <a
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-text-muted hover:text-text"
              >
                <GithubIcon size={18} />
              </a>
              <a
                href={site.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-text-muted hover:text-text"
              >
                <LinkedinIcon size={18} />
              </a>
            </div>
          </nav>
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="h-px bg-accent transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
      />
    </header>
  );
}
