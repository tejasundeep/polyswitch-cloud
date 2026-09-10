"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Check, X, Terminal, Loader2, AlertCircle } from "lucide-react";
import type { ApprovalRequest } from "../lib/client";

interface ApprovalsInboxProps {
  approvals: ApprovalRequest[];
  loading: boolean;
  onDecide: (requestId: string, approved: boolean) => Promise<void>;
  onRefresh: () => void;
}

export function ApprovalsInbox({ approvals, loading, onDecide, onRefresh }: ApprovalsInboxProps) {
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const pendingRequests = approvals.filter((a) => a.state === "open" || !a.state);

  async function handleDecision(id: string, approved: boolean) {
    try {
      setDecidingId(id);
      await onDecide(id, approved);
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Governance & Human-in-the-Loop
            {pendingRequests.length > 0 && (
              <span className="text-xs font-semibold text-rose-300 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 animate-pulse">
                {pendingRequests.length} pending
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            Review and authorize sensitive shell commands, file modifications, and cloud actions remotely from any device.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-auto rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          Check for Approvals
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400">Loading pending requests...</p>
          </div>
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">All Clear</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            No sensitive operations require approval right now. Agents run safely within configured auto-approval boundaries.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((req) => {
            const reqId = req.id || req.requestId || "";
            const isDeciding = decidingId === reqId;

            return (
              <div
                key={reqId}
                className="relative flex flex-col justify-between rounded-2xl border border-rose-900/60 bg-slate-900/90 p-5 shadow-xl transition-all sm:flex-row sm:items-center gap-4"
              >
                <div className="space-y-1.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                      <ShieldAlert className="h-3 w-3" />
                      Approval Required
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-cyan-300">
                      <Terminal className="h-3 w-3" />
                      {req.tool}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-white leading-snug break-words">
                    {req.summary}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Thread: <span className="text-slate-300">{req.threadId || "global"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleDecision(reqId, false)}
                    disabled={isDeciding}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:border-rose-700 hover:bg-rose-950/50 hover:text-rose-300 transition-all disabled:opacity-50"
                  >
                    {isDeciding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Reject
                  </button>

                  <button
                    onClick={() => handleDecision(reqId, true)}
                    disabled={isDeciding}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
                  >
                    {isDeciding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
