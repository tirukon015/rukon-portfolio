"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const json = await res.json();
        setStatus("error");
        setErrorMessage(json.error || "Authentication failed.");
        return;
      }

      window.location.reload();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="py-24 sm:py-32">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-border bg-bg-elevated p-8 sm:p-10 shadow-[var(--shadow-card)]">
          <div className="inline-flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent">
            <Lock size={12} />
            <span>Administrator Security Gate</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-text">
            Access Management
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Authenticate to review, approve, or revoke confidential portfolio access requests.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <div>
              <label
                htmlFor="admin-password"
                className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint"
              >
                Admin Secret Key
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Enter admin password…"
                className="mt-2 w-full border-b border-border-strong bg-transparent px-0 py-2.5 text-base text-text outline-none transition-colors focus:border-accent"
              />
            </div>

            {status === "error" && (
              <p role="alert" className="text-xs font-medium text-red-400">
                {errorMessage}
              </p>
            )}

            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? (
                "Verifying…"
              ) : (
                <>
                  Authenticate <ArrowRight size={14} />
                </>
              )}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
