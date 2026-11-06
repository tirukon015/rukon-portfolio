"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { CheckCircle2, XCircle, Ban, LogOut, ShieldCheck, History } from "lucide-react";
import type { AccessRequest, AccessAuditLog } from "@/lib/access/types";

interface Props {
  initialRequests: AccessRequest[];
  initialLogs: AccessAuditLog[];
}

export function AdminDashboardView({ initialRequests, initialLogs }: Props) {
  const [requests, setRequests] = useState<AccessRequest[]>(initialRequests);
  const [logs] = useState<AccessAuditLog[]>(initialLogs);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "revoked">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject" | "revoke", expiresInDays = 7) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, expiresInDays }),
      });

      if (res.ok) {
        const json = await res.json();
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? json.request : r))
        );
      } else {
        alert("Action failed. Please refresh and check your admin session.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  const filteredRequests = requests.filter((r) => (filter === "all" ? true : r.status === filter));

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const revokedCount = requests.filter((r) => r.status === "revoked").length;

  return (
    <div className="pt-10 pb-24 sm:pb-32">
      <Container>
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-accent">
              <ShieldCheck size={14} />
              <span>Admin Access Console</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">
              Confidentiality Access Requests
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-xs text-text-muted transition-colors hover:border-border-strong hover:text-text"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Stats Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-text-faint">Pending</span>
            <p className="mt-2 text-2xl font-bold text-accent">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-text-faint">Active Approved</span>
            <p className="mt-2 text-2xl font-bold text-emerald-400">{approvedCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-text-faint">Revoked / Rejected</span>
            <p className="mt-2 text-2xl font-bold text-red-400">{revokedCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-text-faint">Total Audit Logs</span>
            <p className="mt-2 text-2xl font-bold text-text-muted">{logs.length}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-border pb-4">
          {(["all", "pending", "approved", "rejected", "revoked"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                filter === tab
                  ? "bg-accent text-accent-contrast font-semibold"
                  : "bg-bg-elevated border border-border text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Request Items */}
        <div className="mt-8 flex flex-col gap-4">
          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-bg-elevated/40 p-12 text-center text-sm text-text-faint">
              No access requests matching current filter.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-bg-elevated p-6 shadow-[var(--shadow-card)] transition-colors hover:border-border-strong lg:flex-row lg:items-center"
              >
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-semibold text-text">{req.name}</span>
                    <span className="font-mono text-xs text-text-muted">({req.email})</span>
                    <StatusBadge status={req.status} />
                  </div>

                  {(req.company || req.role) && (
                    <p className="mt-1 text-xs text-text-faint font-mono">
                      {req.role} {req.role && req.company ? "at" : ""} {req.company}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    <span className="font-mono text-xs text-text-faint">Reason: </span>
                    {req.reason}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 font-mono text-[11px] text-text-faint">
                    <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                    {req.expiresAt && (
                      <span className="text-accent">
                        Expires: {new Date(req.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(req.id, "approve", 7)}
                        disabled={loadingId === req.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-mono text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-strong"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve (7d)</span>
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "reject")}
                        disabled={loadingId === req.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-mono text-xs text-red-400 transition-colors hover:border-red-400/50"
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {req.status === "approved" && (
                    <button
                      onClick={() => handleAction(req.id, "revoke")}
                      disabled={loadingId === req.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      <Ban size={13} />
                      <span>Revoke Access</span>
                    </button>
                  )}

                  {req.status === "rejected" && (
                    <button
                      onClick={() => handleAction(req.id, "approve", 7)}
                      disabled={loadingId === req.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-mono text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <span>Reconsider & Approve</span>
                    </button>
                  )}

                  {req.status === "revoked" && (
                    <button
                      onClick={() => handleAction(req.id, "approve", 7)}
                      disabled={loadingId === req.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 font-mono text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <span>Re-activate Access</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security Audit Log */}
        <div className="mt-16 border-t border-border pt-10">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-text-faint">
            <History size={13} />
            <span>Security & Access Audit Trail (Latest 50)</span>
          </div>

          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-bg-elevated">
            {logs.slice(0, 50).map((log) => (
              <div key={log.id} className="flex flex-col justify-between gap-2 p-4 text-xs sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-accent uppercase tracking-wider text-[11px]">{log.action}</span>
                  <span className="text-text-muted">{log.details}</span>
                </div>
                <span className="font-mono text-text-faint shrink-0 text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

function StatusBadge({ status }: { status: AccessRequest["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
        Approved
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-400">
        Pending Review
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-elevated px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-faint">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-400">
      Revoked
    </span>
  );
}
