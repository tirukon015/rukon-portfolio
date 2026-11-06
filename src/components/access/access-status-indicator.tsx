"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";

interface Props {
  isAuthorized: boolean;
}

export function AccessStatusIndicator({ isAuthorized }: Props) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  if (!isAuthorized) return null;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/access/logout", { method: "POST" });
    router.push("/?logged_out=true");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-accent/20 bg-accent-soft/80 backdrop-blur-md px-4 py-1.5 text-xs font-mono text-accent">
      <div className="flex items-center gap-2">
        <ShieldCheck size={13} className="shrink-0 text-accent" />
        <span className="font-semibold uppercase tracking-wider text-[11px]">
          Authorized Access Active
        </span>
        <span className="hidden sm:inline text-text-muted">· Original client and business records unlocked</span>
      </div>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted transition-colors hover:text-text underline decoration-border-strong underline-offset-2"
      >
        <LogOut size={11} />
        <span>{loggingOut ? "Signing out…" : "Lock & Exit"}</span>
      </button>
    </div>
  );
}
