"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/use-media-query";

const ACTIVE_RADIUS = 130; // px, the "flashlight" size at full reveal

/** Fully collapsed: mask covers nothing, so nothing of the image shows. */
const IDLE_MASK = "radial-gradient(circle 0.1px at 0px 0px, #000 0%, transparent 100%)";

/**
 * The hero's right-side visual: a developer graphic hidden under the grid,
 * revealed only inside a soft circular "flashlight" that follows the
 * cursor. Fully imperative (no React state per pointer move), position
 * and radius are eased in a single rAF loop and written straight to a
 * dedicated mask layer, matching the pattern CursorGrid already uses.
 *
 * The mask is applied to a plain wrapper <div> we own outright (not to the
 * Next.js <Image> itself), so nothing in Next's own re-render/loading
 * lifecycle can ever overwrite our imperative style mutations. The image's
 * own dark backdrop is blended with `mix-blend-mode: screen` at reduced
 * opacity so the reveal merges into the page instead of showing up as a
 * bright, flat panel, there's no separate synthetic glow layer competing
 * with it.
 *
 * Desktop / fine-pointer only. On touch devices this renders nothing, so
 * only the existing grid shows, there is no reliable hover to drive it.
 */
export function HeroSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskedRef = useRef<HTMLDivElement>(null);
  const supportsFinePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const interactive = supportsFinePointer && !reducedMotion;

  useEffect(() => {
    if (!interactive) return;

    const container = containerRef.current;
    const masked = maskedRef.current;
    if (!container || !masked) return;

    const target = { x: 0, y: 0, intensity: 0 };
    const current = { x: 0, y: 0, intensity: 0 };
    let rafId = 0;
    let running = false;

    const paint = () => {
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      current.intensity += (target.intensity - current.intensity) * 0.14;

      const r = Math.max(0.1, current.intensity * ACTIVE_RADIUS);
      const mask = `radial-gradient(circle ${r}px at ${current.x}px ${current.y}px, #000 0%, #000 30%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.25) 70%, transparent 100%)`;
      masked.style.maskImage = mask;
      masked.style.webkitMaskImage = mask;

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
      const rect = container.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      target.intensity = 1;
      ensureRunning();
    };

    const handleLeave = () => {
      target.intensity = 0;
      ensureRunning();
    };

    ensureRunning();

    container.addEventListener("pointermove", handleMove, { passive: true });
    container.addEventListener("pointerleave", handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
    };
  }, [interactive]);

  if (!interactive) return null;

  return (
    <div ref={containerRef} aria-hidden="true" className="relative h-full w-full overflow-hidden">
      <div
        ref={maskedRef}
        className="absolute inset-0"
        style={{
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskImage: IDLE_MASK,
          WebkitMaskImage: IDLE_MASK,
          mixBlendMode: "screen",
          opacity: 0.6,
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
