"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { site, nav } from "@/content/site";
import { useActiveSection } from "@/lib/use-active-section";
import { cn } from "@/lib/utils";

const sectionIds = nav
  .map((item) => item.sectionId)
  .filter((id): id is string => id !== null);

/** A stable empty list, so the section observer is not re-created on every render off the homepage. */
const NO_SECTIONS: string[] = [];

/**
 * Site header.
 *
 * One row: wordmark, five links, theme toggle. No progress bar, no pill
 * button, no icon cluster; those belong in the footer and the contact
 * section, where they are content rather than chrome.
 *
 * Active state has two sources. On the homepage the anchor links follow the
 * section in view. Everywhere else a link is active when the pathname starts
 * with its `match`, so "Work" is lit on a case study and "Writing" on a post.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const activeSection = useActiveSection(isHome ? sectionIds : NO_SECTIONS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // The drawer closes when a link in it is clicked (see below), which covers
  // both a route change and a same-page anchor without an effect on pathname.
  const isActive = (item: (typeof nav)[number]) => {
    if (isHome) return item.sectionId !== null && activeSection === item.sectionId;
    return item.match !== null && pathname.startsWith(item.match);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || open
          ? "border-border bg-bg/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-text"
          aria-label={`${site.name}, home`}
        >
          {site.shortName}
          <span aria-hidden="true" className="text-accent">
            .
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-1 text-sm transition-colors",
                  active ? "text-text" : "text-text-muted hover:text-text",
                  // A hairline that reads as "you are here" without a pill.
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300",
                  active && "after:scale-x-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle className="grid h-8 w-8 place-items-center rounded-full text-text-muted transition-colors hover:text-text" />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="grid h-9 w-9 place-items-center rounded-full text-text-muted transition-colors hover:text-text" />
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-text"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-bg md:hidden"
      >
        <nav className="flex flex-col px-6 py-3" aria-label="Mobile">
          {nav.map((item, i) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                ref={i === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b border-border py-4 text-lg tracking-tight transition-colors last:border-b-0",
                  active ? "text-text" : "text-text-muted hover:text-text"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
