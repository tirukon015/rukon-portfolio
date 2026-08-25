"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydration-safe media query hook. Server snapshot is always `false`
 * (matches SSR, where no viewport/pointer info exists); the client
 * snapshot reflects the live query and updates on change.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
