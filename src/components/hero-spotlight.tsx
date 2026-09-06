"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/use-media-query";

/** How far from the photo the reveal starts responding. */
const PROXIMITY_RANGE = 420;
/** Reveal size at full strength. Large enough that a direct hover reads as "the photo". */
const MAX_RADIUS = 560;
/** Peak opacity of the revealed layer. */
const MAX_OPACITY = 0.72;

/** Fully collapsed: mask covers nothing, so nothing of the image shows. */
const IDLE_MASK = "radial-gradient(circle 0.1px at 0px 0px, #000 0%, transparent 100%)";

/**
 * The hero's right-side visual: a portrait hidden under the grid, revealed as
 * the pointer approaches it.
 *
 * Proximity rather than hover. The pointer is tracked on the window and the
 * reveal strength comes from the distance to the nearest edge of this box, so
 * the image begins to surface while the cursor is still on its way and is
 * clearly visible once the pointer is actually over it. Hover alone would make
 * it binary, and binary is what makes this kind of effect feel like a toggle
 * instead of a presence.
 *
 * Fully imperative (no React state per pointer move): position, radius and
 * opacity are eased in a single rAF loop and written straight to a dedicated
 * mask layer, matching the pattern CursorGrid already uses.
 *
 * The mask is applied to a plain wrapper <div> we own outright (not to the
 * Next.js <Image> itself), so nothing in Next's own re-render/loading
 * lifecycle can ever overwrite our imperative style mutations. The image's
 * own dark backdrop is blended with `mix-blend-mode: screen` so the reveal
 * merges into the page instead of showing up as a bright, flat panel.
 *
 * Coarse-pointer devices get a tap toggle instead, because there is no hover
 * to approach with. Reduced motion renders nothing at all, as before: with no
 * animation there is no reveal to cue, so the prompt is withheld too rather
 * than promising an interaction that will not happen.
 */
export function HeroSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskedRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  /*
   * Asked as "coarse" rather than "fine" on purpose. `useMediaQuery` reports
   * false during server render and hydration, and this box only exists at the
   * lg breakpoint, where a mouse is the overwhelmingly likely case. Phrasing it
   * this way makes the pre-hydration default the cursor wording, so a desktop
   * visitor never sees the touch hint flash and correct itself.
   */
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const interactive = !reducedMotion;

  useEffect(() => {
    if (!interactive) return;

    const container = containerRef.current;
    const masked = maskedRef.current;
    const cta = ctaRef.current;
    if (!container || !masked) return;

    const target = { x: 0, y: 0, intensity: 0 };
    const current = { x: 0, y: 0, intensity: 0 };
    let rafId = 0;
    let running = false;
    let tapRevealed = false;

    const paint = () => {
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      current.intensity += (target.intensity - current.intensity) * 0.12;

      const p = current.intensity;
      // Eased so a distant approach stays a hint and the last stretch does the
      // work, rather than the image fading up linearly across the whole page.
      const strength = Math.pow(p, 1.4);

      const r = Math.max(0.1, strength * MAX_RADIUS);
      const mask = `radial-gradient(circle ${r}px at ${current.x}px ${current.y}px, #000 0%, #000 32%, rgba(0,0,0,0.72) 52%, rgba(0,0,0,0.28) 72%, transparent 100%)`;
      masked.style.maskImage = mask;
      masked.style.webkitMaskImage = mask;
      masked.style.opacity = String(strength * MAX_OPACITY);

      // The prompt retires as the photo arrives: once you have found it, the
      // instruction is noise.
      if (cta) cta.style.opacity = String(1 - p * 0.8);

      const settled =
        Math.abs(target.intensity - current.intensity) < 0.003 &&
        Math.abs(target.x - current.x) < 0.4 &&
        Math.abs(target.y - current.y) < 0.4;

      if (!settled) {
        rafId = requestAnimationFrame(paint);
      } else {
        running = false;
      }
    };

    const ensureRunning = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(paint);
      }
    };

    const handleMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;

      const rect = container.getBoundingClientRect();

      // Distance to the nearest point on the box: zero while the pointer is
      // inside it, growing once outside.
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const distance = Math.hypot(dx, dy);

      // The reveal centre follows the pointer, clamped to the box, so an
      // approach from the left lights the left edge first instead of jumping.
      const clampedX = Math.min(Math.max(e.clientX, rect.left), rect.right);
      const clampedY = Math.min(Math.max(e.clientY, rect.top), rect.bottom);

      target.x = clampedX - rect.left;
      target.y = clampedY - rect.top;
      target.intensity = Math.max(0, Math.min(1, 1 - distance / PROXIMITY_RANGE));
      ensureRunning();
    };

    // Touch and stylus taps: no approach to read, so it is a toggle.
    const handleTap = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const rect = container.getBoundingClientRect();
      tapRevealed = !tapRevealed;
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      target.intensity = tapRevealed ? 1 : 0;
      ensureRunning();
    };

    ensureRunning();

    window.addEventListener("pointermove", handleMove, { passive: true });
    container.addEventListener("pointerdown", handleTap, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerdown", handleTap);
    };
  }, [interactive]);

  if (!interactive) return null;

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/*
        The prompt. Sits above the portrait's visual mass and never intercepts
        the pointer, so it cannot block the very hover it is asking for.

        aria-hidden because it describes a pointer gesture that reveals a purely
        decorative image (alt=""). A screen reader user gains nothing from the
        instruction and loses nothing by not hearing it.
      */}
      <div
        ref={ctaRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1 z-10 select-none transition-opacity duration-300"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          The person behind the systems &rarr;
        </p>
        <p className="mt-1 pl-4 text-[11px] text-text-faint">
          {coarsePointer ? "Tap to reveal" : "Move cursor to reveal"}
        </p>
      </div>

      <div
        ref={maskedRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskImage: IDLE_MASK,
          WebkitMaskImage: IDLE_MASK,
          mixBlendMode: "screen",
          opacity: 0,
        }}
      >
        <Image
          src="/images/hero-developer.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 42vw, 0px"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
