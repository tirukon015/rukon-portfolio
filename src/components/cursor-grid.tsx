"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/use-media-query";

const CELL = 44; // grid spacing in CSS px
const BASE_ALPHA = 0.05; // idle grid, almost invisible
const BRIGHT_ALPHA = 0.34; // grid line brightness at the cursor
const GLOW_RADIUS = 260; // px, how far the spotlight reaches
const FALLBACK_LINE_RGB = "148, 197, 224";
const FALLBACK_GLOW_RGB = "79, 178, 224";

/**
 * Cursor-reactive background grid for the hero.
 *
 * Idle: a near-invisible base grid.
 * Active: a soft radial glow + brighter grid lines follow the pointer and
 * fade smoothly with distance.
 *
 * Canvas-based (no WebGL). Only runs its render loop while the pointer is
 * inside the hero or a fade is still settling, otherwise it's fully idle.
 * Devices without a fine pointer, and prefers-reduced-motion, get a static
 * CSS grid instead and never mount the canvas or any listeners.
 */
export function CursorGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const supportsFinePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const interactive = supportsFinePointer && !reducedMotion;

  useEffect(() => {
    if (!interactive) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!maskRef.current) maskRef.current = document.createElement("canvas");
    const mask = maskRef.current;
    const maskCtx = mask.getContext("2d");
    if (!maskCtx) return;

    // Read the current theme's grid colors from CSS custom properties so
    // the effect matches light/dark mode instead of being hardcoded.
    let lineRgb = FALLBACK_LINE_RGB;
    let glowRgb = FALLBACK_GLOW_RGB;
    const readThemeColors = () => {
      const styles = getComputedStyle(document.documentElement);
      lineRgb = styles.getPropertyValue("--grid-line-rgb").trim() || FALLBACK_LINE_RGB;
      glowRgb = styles.getPropertyValue("--grid-glow-rgb").trim() || FALLBACK_GLOW_RGB;
    };
    readThemeColors();

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, mask]) {
        c.width = Math.max(1, Math.round(width * dpr));
        c.height = Math.max(1, Math.round(height * dpr));
        c.style.width = `${width}px`;
        c.style.height = `${height}px`;
      }
    };
    resize();

    const target = { x: width / 2, y: height / 2 };
    const current = { x: target.x, y: target.y };
    let intensity = 0; // 0 = idle, 1 = fully active
    let targetIntensity = 0;
    let pointerInside = false;
    let rafId = 0;
    let running = false;

    const drawGrid = (context: CanvasRenderingContext2D, alpha: number) => {
      context.strokeStyle = `rgba(${lineRgb}, ${alpha})`;
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x <= width; x += CELL) {
        context.moveTo(x + 0.5, 0);
        context.lineTo(x + 0.5, height);
      }
      for (let y = 0; y <= height; y += CELL) {
        context.moveTo(0, y + 0.5);
        context.lineTo(width, y + 0.5);
      }
      context.stroke();
    };

    const frame = () => {
      // Ease current position and intensity toward their targets.
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      intensity += (targetIntensity - intensity) * 0.12;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (intensity > 0.002) {
        // Soft color glow under the grid.
        const glow = ctx.createRadialGradient(
          current.x,
          current.y,
          0,
          current.x,
          current.y,
          GLOW_RADIUS
        );
        glow.addColorStop(0, `rgba(${glowRgb}, ${0.1 * intensity})`);
        glow.addColorStop(1, `rgba(${glowRgb}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // Base grid, always present, barely visible.
      drawGrid(ctx, BASE_ALPHA);

      if (intensity > 0.002) {
        // Bright grid, masked to a radial falloff around the cursor.
        maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        maskCtx.clearRect(0, 0, width, height);
        drawGrid(maskCtx, BRIGHT_ALPHA * intensity);
        maskCtx.globalCompositeOperation = "destination-in";
        const falloff = maskCtx.createRadialGradient(
          current.x,
          current.y,
          0,
          current.x,
          current.y,
          GLOW_RADIUS
        );
        falloff.addColorStop(0, "rgba(255,255,255,1)");
        falloff.addColorStop(1, "rgba(255,255,255,0)");
        maskCtx.fillStyle = falloff;
        maskCtx.fillRect(0, 0, width, height);
        maskCtx.globalCompositeOperation = "source-over";

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(mask, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const settled =
        Math.abs(targetIntensity - intensity) < 0.002 &&
        Math.abs(target.x - current.x) < 0.3 &&
        Math.abs(target.y - current.y) < 0.3;

      if (!settled || pointerInside) {
        rafId = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const ensureRunning = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      pointerInside = true;
      targetIntensity = 1;
      ensureRunning();
    };

    const handlePointerLeave = () => {
      pointerInside = false;
      targetIntensity = 0;
      ensureRunning();
    };

    // Idle paint so the base grid is visible before any interaction.
    ensureRunning();

    // Re-read colors and force one repaint when the theme toggle changes
    // data-theme, otherwise an idle (non-animating) grid would keep
    // showing the previous theme's colors until the next pointer move.
    const themeObserver = new MutationObserver(() => {
      readThemeColors();
      ensureRunning();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {interactive ? (
        <canvas ref={canvasRef} className="absolute inset-0" />
      ) : (
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgb(var(--grid-line-rgb)) 0, rgb(var(--grid-line-rgb)) 1px, transparent 1px, transparent 44px), repeating-linear-gradient(0deg, rgb(var(--grid-line-rgb)) 0, rgb(var(--grid-line-rgb)) 1px, transparent 1px, transparent 44px)",
          }}
        />
      )}
    </div>
  );
}
