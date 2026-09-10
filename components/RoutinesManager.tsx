"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Play, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  History, 
  ChevronRight, 
  FileText,
  X
} from "lucide-react";
import type { Routine, RoutineRun } from "../lib/client";

interface RoutinesManagerProps {
  routines: Routine[];
  runs: RoutineRun[];
  loading: boolean;
  onTriggerRoutine: (routineId: string) => Promise<void>;
  onRefresh: () => void;
}

export function RoutinesManager({
  routines,
  runs,
  loading,
  onTriggerRoutine,
  onRefresh,
}: RoutinesManagerProps) {
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [selectedRoutineForLogs, setSelectedRoutineForLogs] = useState<Routine | null>(null);

  async function handleTrigger(id: string) {
    try {
      setTriggeringId(id);
      await onTriggerRoutine(id);
    } finally {
      setTriggeringId(null);
    }
  }

  function formatTime(timestamp?: number | null) {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatNextRun(timestamp?: number | null) {
    if (!timestamp) return "Scheduled on event / manual";
    const diff = timestamp - Date.now();
    if (diff <= 0) return "Imminent";
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `in ${hours}h ${remainingMins}m`;
  }

  const selectedRuns = selectedRoutineForLogs
    ? runs.filter((r) => r.routineId === selectedRoutineForLogs.id).slice(0, 10)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Autonomous Routines 2.0
            <span className="text-xs font-normal text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60">
              24/7 Always-On
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Background automations that run continuously in the cloud even when your desktop app is closed.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-auto rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          Refresh Schedules
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400">Loading routines...</p>
          </div>
        </div>
      ) : routines.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
          <Zap className="h-10 w-10 text-slate-600 mb-2" />
          <h3 className="text-base font-medium text-white">No Routines Configured</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Create recurring background routines in Polyswitch to automate market monitoring, code review, or notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {routines.map((routine) => {
            const isRunning = routine.status === "running" || triggeringId === routine.id;

            return (
              <div
                key={routine.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/75 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-cyan-500/40 hover:bg-slate-900/90"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md ${
                          isRunning
                            ? "bg-cyan-500 text-slate-950 animate-pulse"
                            : "bg-slate-800 text-cyan-400 border border-slate-700"
                        }`}
                      >
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {routine.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Assigned Bot: <span className="text-slate-300 font-semibold">{routine.botId}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        isRunning
                          ? "bg-cyan-950/80 border border-cyan-700 text-cyan-300"
                          : routine.status === "error"
                          ? "bg-rose-950/80 border border-rose-800 text-rose-300"
                          : "bg-slate-800/80 border border-slate-700 text-slate-400"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-2.5 w-2.5 animate-spin text-cyan-400" />
                          Executing
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Idle
                        </>
                      )}
                    </span>
                  </div>

                  {/* Schedule & Timing Info */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                      <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold">Schedule</span>
                        <span className="font-mono text-[11px] text-slate-300 truncate block">
                          {routine.schedule.cron || (routine.schedule.intervalMs ? `${Math.round(routine.schedule.intervalMs / 60000)}m interval` : "Trigger")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                      <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold">Next Run</span>
                        <span className="font-mono text-[11px] text-cyan-300 truncate block">
                          {formatNextRun(routine.nextRunAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverable Snapshot */}
                  {routine.lastDeliverable && (
                    <div className="mt-3 rounded-xl bg-slate-950/40 p-3 border border-slate-800/60 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
                        <FileText className="h-3 w-3 text-cyan-400" />
                        Latest Deliverable:
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                        {routine.lastDeliverable}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <button
                    onClick={() => setSelectedRoutineForLogs(routine)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>Run History</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => handleTrigger(routine.id)}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-md shadow-cyan-500/10 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Run Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine Logs & History Drawer / Modal */}
      {selectedRoutineForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="h-full w-full max-w-lg border-l border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Execution History</h3>
                  <p className="text-xs text-slate-400">{selectedRoutineForLogs.name}</p>
                </div>
                <button
                  onClick={() => setSelectedRoutineForLogs(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {selectedRuns.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No run logs recorded yet for this routine.
                  </p>
                ) : (
                  selectedRuns.map((run) => (
                    <div
                      key={run.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            run.status === "completed"
                              ? "text-emerald-400"
                              : run.status === "failed"
                              ? "text-rose-400"
                              : "text-cyan-400"
                          }`}
                        >
                          {run.status === "completed" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                          {run.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatTime(run.startedAt)} ({run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : "..."})
                        </span>
                      </div>

                      {run.deliverable && (
                        <div className="rounded-lg bg-slate-900 p-2.5 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap border border-slate-800/80">
                          {run.deliverable}
                        </div>
                      )}

                      {run.logs && run.logs.length > 0 && (
                        <div className="space-y-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
                          {run.logs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-slate-600 shrink-0">
                                {new Date(log.at).toLocaleTimeString()}
                              </span>
                              <span>{log.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-6">
              <button
                onClick={() => setSelectedRoutineForLogs(null)}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
