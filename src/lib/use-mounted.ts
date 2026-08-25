"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only after the client has hydrated. Used to defer anything that
 * would otherwise mismatch server/client output (e.g. reading the
 * resolved theme before next-themes has run on the client).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
