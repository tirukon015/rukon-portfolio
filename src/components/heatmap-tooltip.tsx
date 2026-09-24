"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tip = { x: number; y: number; below: boolean; date: string; count: number };

function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The one piece of the contribution calendar that needs JavaScript.
 *
 * The grid itself is server-rendered with the real date and count on every
 * cell. This wrapper does three things:
 *
 * - Pointer: listens for the pointer over any cell carrying `data-date` and
 *   positions a single two-line tooltip (date, then count) near it. One
 *   element, event delegation, no per-cell handlers, nothing rendered until
 *   a cell is actually hovered.
 * - Keyboard: the scroller is one tab stop. Arrow keys move a focus marker
 *   across days by calendar date (left and right a week, up and down a day),
 *   Home and End jump to the first and last day, and the tooltip follows.
 *   That gives keyboard users the per-day detail without turning 365 cells
 *   into 365 tab stops. The current label is announced through a polite
 *   live region.
 * - Layout: scrolls the calendar to its most recent week on mount, because on
 *   a narrow screen the grid overflows sideways and the interesting end is
 *   the right-hand one. The tooltip is clamped inside the wrapper and flips
 *   below the cell when there is no room above, so it never clips at an edge.
 */
export function HeatmapTooltip({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [announce, setAnnounce] = useState("");
  const focusIndex = useRef(-1);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, []);

  const cells = useCallback(
    () => Array.from(wrapperRef.current?.querySelectorAll<HTMLElement>("[data-date]") ?? []),
    []
  );

  const showFor = useCallback((cell: HTMLElement) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const rect = cell.getBoundingClientRect();
    const x = rect.left - wrapperRect.left + rect.width / 2;
    // Keep the bubble inside the wrapper horizontally (it is ~200px wide).
    const half = 100;
    const clampedX = Math.min(Math.max(x, half), Math.max(half, wrapperRect.width - half));
    // Flip below the cell when the cell sits near the top of the viewport.
    const below = rect.top < 72;
    setTip({
      x: clampedX,
      y: below ? rect.bottom - wrapperRect.top + 8 : rect.top - wrapperRect.top - 8,
      below,
      date: cell.dataset.date ?? "",
      count: Number(cell.dataset.count ?? 0),
    });
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const over = (e: Event) => {
      const cell = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-date]");
      if (cell) showFor(cell);
    };
    const out = (e: Event) => {
      const next = (e as PointerEvent).relatedTarget as HTMLElement | null;
      if (next?.closest("[data-date]")) return;
      if (document.activeElement === scrollerRef.current && focusIndex.current >= 0) return;
      setTip(null);
    };

    wrapper.addEventListener("pointerover", over);
    wrapper.addEventListener("pointerout", out);
    return () => {
      wrapper.removeEventListener("pointerover", over);
      wrapper.removeEventListener("pointerout", out);
    };
  }, [showFor]);

  const moveFocus = useCallback(
    (index: number) => {
      const all = cells();
      if (all.length === 0) return;
      const clamped = Math.min(Math.max(index, 0), all.length - 1);
      const previous = all[focusIndex.current];
      if (previous) previous.removeAttribute("data-focused");
      focusIndex.current = clamped;
      const cell = all[clamped];
      cell.setAttribute("data-focused", "");
      cell.scrollIntoView({ block: "nearest", inline: "nearest" });
      showFor(cell);
      setAnnounce(cell.dataset.label ?? "");
    },
    [cells, showFor]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const all = cells();
    if (all.length === 0) return;
    const current = focusIndex.current < 0 ? all.length - 1 : focusIndex.current;

    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      moveFocus(e.key === "Home" ? 0 : all.length - 1);
      return;
    }

    // Movement is by calendar date rather than by array index, because the
    // first and last weeks of the year can be partial and the cells are laid
    // out row by row. Left and right move a week, up and down move a day.
    const deltaDays: Record<string, number> = {
      ArrowLeft: -7,
      ArrowRight: 7,
      ArrowUp: -1,
      ArrowDown: 1,
    };
    const delta = deltaDays[e.key];
    if (delta === undefined) return;
    e.preventDefault();

    const date = all[current]?.dataset.date;
    if (!date) return;
    const [y, m, d] = date.split("-").map(Number);
    const target = new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
    const index = all.findIndex((cell) => cell.dataset.date === target);
    if (index >= 0) moveFocus(index);
  };

  const onFocus = () => {
    if (focusIndex.current < 0) moveFocus(cells().length - 1);
    else moveFocus(focusIndex.current);
  };

  const onBlur = () => {
    const all = cells();
    const previous = all[focusIndex.current];
    if (previous) previous.removeAttribute("data-focused");
    setTip(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-label="Contribution calendar. Use the arrow keys to move between days."
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="heat-scroller overflow-x-auto pb-1 outline-none [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-accent"
      >
        {children}
      </div>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      {tip ? (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-strong bg-bg-elevated-2 px-3 py-2 text-xs shadow-[var(--shadow-lift)] ${
            tip.below ? "" : "-translate-y-full"
          }`}
          style={{ left: tip.x, top: tip.y }}
        >
          <p className="font-medium text-text">{longDate(tip.date)}</p>
          <p className="mt-0.5 text-text-muted">
            {tip.count === 0
              ? "No contributions"
              : `${tip.count.toLocaleString("en-US")} contribution${tip.count === 1 ? "" : "s"}`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
