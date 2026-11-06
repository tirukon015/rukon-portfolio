"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export function AccessRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !reason) {
      setStatus("error");
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, role, reason }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error || "Failed to submit request.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-text">Access Request Received</h3>
        <p className="mt-2 text-sm text-text-muted max-w-md mx-auto">
          Thank you. Your request has been forwarded directly for review. You will receive an email with your
          one-click access link once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="req-name" className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            Your Name *
          </label>
          <input
            id="req-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="mt-2 w-full border-b border-border-strong bg-transparent px-0 py-2.5 text-base text-text outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="req-email" className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            Work or Personal Email *
          </label>
          <input
            id="req-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            className="mt-2 w-full border-b border-border-strong bg-transparent px-0 py-2.5 text-base text-text outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="req-company" className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            Company / Organization
          </label>
          <input
            id="req-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Organization name (optional)"
            className="mt-2 w-full border-b border-border-strong bg-transparent px-0 py-2.5 text-base text-text outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="req-role" className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
            Your Role / Title
          </label>
          <input
            id="req-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Technical Recruiter, Engineering Lead"
            className="mt-2 w-full border-b border-border-strong bg-transparent px-0 py-2.5 text-base text-text outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="req-reason" className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
          Reason for Access Request *
        </label>
        <textarea
          id="req-reason"
          required
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly describe your purpose (e.g. evaluating engineering experience for a Full-Stack Systems role, hiring evaluation, reference check)…"
          className="mt-2 w-full resize-y border-b border-border-strong bg-transparent px-0 py-2.5 text-base text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-xs font-medium text-red-400">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? (
            "Submitting Request…"
          ) : (
            <>
              Submit Access Request <Send size={14} />
            </>
          )}
        </Button>
        <span className="font-mono text-[11px] text-text-faint">
          Usually reviewed within 24 hours
        </span>
      </div>
    </form>
  );
}
