"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Reveal strength as soon as the pointer is anywhere in the hero, before it
 * has come near the portrait. Enough to be noticed, not enough to read as a
 * second image sitting beside the headline.
 */
const ENTRY_STRENGTH = 0.3;
/** How far from the portrait the reveal climbs from ENTRY_STRENGTH to full, in CSS px. */
const PROXIMITY_RANGE = 380;
/** Reveal radius as a fraction of the box diagonal, at entry and at full strength. */
const MIN_RADIUS = 0.3;
const MAX_RADIUS = 0.78;
/** Peak layer opacity. Below ENTRY_STRENGTH the layer fades to fully hidden. */
const MAX_OPACITY = 0.9;

/**
 * The hero's portrait, hidden until the cursor finds it.
 *
 * State model, deliberately simple:
 *
 *   hidden  ->  pointer enters the hero  ->  revealed around the pointer
 *           <-  pointer leaves the hero  <-  follows the pointer while inside
 *
 * There is no idle reveal and no resting vignette. Before any interaction the
 * layer's opacity is zero; after the pointer leaves it returns to zero. While
 * the pointer is inside the hero the reveal centre tracks it (clamped to the
 * portrait's box, so an approach from the left lights the left edge first) and
 * the strength grows as the pointer nears the portrait.
 *
 * Performance:
 * - No React state per pointer move. Position, radius, opacity and parallax
 *   are eased in one requestAnimationFrame loop that runs only while a value
 *   is still settling, and are written as CSS custom properties. The mask
 *   gradient itself lives in the stylesheet (`.hero-portrait`).
 * - The box's rectangle is cached and refreshed on resize and scroll rather
 *   than measured on every move.
 * - Pointer events are read from the hero section, not the window, so moving
 *   the mouse elsewhere on the page costs nothing.
 *
 * Coarse-pointer devices have no cursor to enter with, so a tap on the
 * portrait area toggles a full reveal, and it starts hidden like everywhere
 * else. Reduced motion keeps the same hidden/revealed states but switches
 * them instantly on enter and leave, with no animation loop.
 */
export function HeroSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    const hint = hintRef.current;
    if (!container || !layer) return;

    // The hero section. The container itself is only the portrait's box.
    const surface = container.closest("section") ?? container;

    const setVars = (x: number, y: number, radius: number, opacity: number) => {
      layer.style.setProperty("--sx", `${x.toFixed(1)}px`);
      layer.style.setProperty("--sy", `${y.toFixed(1)}px`);
      layer.style.setProperty("--sr", `${radius.toFixed(1)}px`);
      layer.style.setProperty("--so", opacity.toFixed(3));
    };

    let rect = container.getBoundingClientRect();
    let diagonal = Math.hypot(rect.width, rect.height);

    const measure = () => {
      rect = container.getBoundingClientRect();
      diagonal = Math.hypot(rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    window.addEventListener("scroll", measure, { passive: true });

    /* ------------------------------------------------------------------ */
    /* Reduced motion: two states, switched instantly, no loop.            */
    /* ------------------------------------------------------------------ */
    if (reducedMotion) {
      const show = () =>
        setVars(rect.width / 2, rect.height * 0.46, diagonal * 0.62, MAX_OPACITY);
      const hide = () => setVars(rect.width / 2, rect.height * 0.46, 0, 0);
      let shown = false;
      const toggle = () => {
        shown = !shown;
        if (shown) show();
        else hide();
      };

      hide();
      if (coarsePointer) {
        container.addEventListener("pointerdown", toggle, { passive: true });
      } else {
        surface.addEventListener("pointerenter", show);
        surface.addEventListener("pointerleave", hide);
      }

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("scroll", measure);
        container.removeEventListener("pointerdown", toggle);
        surface.removeEventListener("pointerenter", show);
        surface.removeEventListener("pointerleave", hide);
      };
    }

    /* ------------------------------------------------------------------ */
    /* Full motion: eased follow while inside, eased fade-out on leave.    */
    /* ------------------------------------------------------------------ */
    const centre = () => ({ x: rect.width / 2, y: rect.height * 0.46 });
    const target = { ...centre(), strength: 0 };
    const current = { ...centre(), strength: 0 };
    let rafId = 0;
    let running = false;
    let tapRevealed = false;

    const paint = () => {
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      current.strength += (target.strength - current.strength) * 0.11;

      const s = current.strength;
      // Eased so the last stretch toward the portrait does the work, rather
      // than the image fading up linearly across the whole hero.
      const eased = Math.pow(s, 1.3);

      const radius = diagonal * (MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * eased);
      // Opacity reaches zero exactly when strength does: no resting state.
      const opacity = Math.min(1, s / ENTRY_STRENGTH) * (0.55 + 0.45 * eased) * MAX_OPACITY;
      setVars(current.x, current.y, radius, opacity);

      // The portrait itself does not move. The reveal window is the only
      // thing that follows the pointer; the image stays exactly where it is.

      // The hint retires as the portrait arrives and returns when it goes.
      if (hint) hint.style.opacity = String(Math.max(0, 1 - s * 1.6));

      const settled =
        Math.abs(target.strength - current.strength) < 0.002 &&
        Math.abs(target.x - current.x) < 0.3 &&
        Math.abs(target.y - current.y) < 0.3;

      if (!settled) {
        rafId = requestAnimationFrame(paint);
      } else {
        // Snap to the exact resting value so a hidden layer is truly at 0.
        if (target.strength === 0) {
          current.strength = 0;
          setVars(current.x, current.y, diagonal * MIN_RADIUS, 0);
        }
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
