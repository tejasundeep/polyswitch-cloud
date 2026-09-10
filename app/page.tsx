"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../components/Header";
import { ConnectionModal } from "../components/ConnectionModal";
import { BotFleetView } from "../components/BotFleetView";
import { RoutinesManager } from "../components/RoutinesManager";
import { ApprovalsInbox } from "../components/ApprovalsInbox";
import { LiveChatDrawer } from "../components/LiveChatDrawer";
import { 
  Bot, 
  Routine, 
  RoutineRun, 
  ApprovalRequest,
  getStoredConnection, 
  testConnection,
  fetchBots, 
  fetchRoutines, 
  fetchApprovals, 
  triggerRoutine, 
  decideApproval 
} from "../lib/client";
import { Zap, ShieldAlert, Cpu, Activity, ArrowUpRight } from "lucide-react";

export default function PolyswitchCloudDashboard() {
  const [activeTab, setActiveTab] = useState<"fleet" | "routines" | "approvals" | "chat">("fleet");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [runnerUrl, setRunnerUrl] = useState("http://localhost:8799");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const [bots, setBots] = useState<Bot[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [runs, setRuns] = useState<RoutineRun[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [selectedBotForChat, setSelectedBotForChat] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      const [b, r, a] = await Promise.allSettled([
        fetchBots(),
        fetchRoutines(),
        fetchApprovals(),
      ]);

      if (b.status === "fulfilled") setBots(b.value);
      if (r.status === "fulfilled") {
        setRoutines(r.value.routines);
        setRuns(r.value.runs);
      }
      if (a.status === "fulfilled") setApprovals(a.value);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    const stored = getStoredConnection();
    setRunnerUrl(stored.url);
    setIsConnecting(true);
    const res = await testConnection(stored.url, stored.token);
    setIsConnected(res.ok);
    setIsConnecting(false);

    if (res.ok) {
      void loadAllData();
    } else {
      setLoadingData(false);
    }
  }, [loadAllData]);

  useEffect(() => {
    // Detect instant pairing parameters from QR code scan or share link
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const runnerParam = searchParams.get("runner");
      const tokenParam = searchParams.get("token");
      if (runnerParam) {
        const { setStoredConnection } = require("../lib/client");
        setStoredConnection(runnerParam, tokenParam || "");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    void checkConnection();

    // Auto-refresh data every 8 seconds
    const interval = setInterval(() => {
      void loadAllData();
    }, 8000);

    return () => clearInterval(interval);
  }, [checkConnection, loadAllData]);

  async function handleTriggerRoutine(routineId: string) {
    await triggerRoutine(routineId);
    setTimeout(() => {
      void loadAllData();
    }, 1000);
  }

  async function handleDecideApproval(requestId: string, approved: boolean) {
    await decideApproval(requestId, approved);
    setApprovals((prev) => prev.filter((a) => (a.id || a.requestId) !== requestId));
  }

  function handleSelectBotForChat(botId: string) {
    setSelectedBotForChat(botId);
    setActiveTab("chat");
  }

  const pendingApprovalsCount = approvals.filter((a) => a.state === "open" || !a.state).length;
  const runningRoutinesCount = routines.filter((r) => r.status === "running").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        isConnecting={isConnecting}
        runnerUrl={runnerUrl}
        pendingApprovalsCount={pendingApprovalsCount}
        activeRoutinesCount={runningRoutinesCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Offline Warning Banner */}
        {!isConnected && !isConnecting && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-800/80 bg-amber-950/40 p-4 text-xs text-amber-200 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <div>
                <p className="font-semibold text-white">Polyswitch Runner Unreachable</p>
                <p className="text-amber-300/80 mt-0.5">
                  Could not reach harness at <code className="font-mono text-amber-100">{runnerUrl}</code>. Make sure the server is running or configure your cloud endpoint.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="self-start sm:self-auto rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 font-medium text-amber-200 hover:bg-amber-500/30 transition-all"
            >
              Configure Endpoint
            </button>
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Agents</span>
              <Cpu className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">{bots.length}</span>
              <span className="text-[11px] text-emerald-400 font-medium">Ready</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab("routines")}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>24/7 Routines</span>
              <Zap className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">{routines.length}</span>
              {runningRoutinesCount > 0 ? (
                <span className="text-[11px] text-cyan-400 font-medium animate-pulse">{runningRoutinesCount} running</span>
              ) : (
                <span className="text-[11px] text-slate-500">Autonomous</span>
              )}
            </div>
          </div>

          <div 
            onClick={() => setActiveTab("approvals")}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm cursor-pointer hover:border-rose-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pending Approvals</span>
              <ShieldAlert className="h-4 w-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">{pendingApprovalsCount}</span>
              <span className={`text-[11px] font-medium ${pendingApprovalsCount > 0 ? "text-rose-400" : "text-slate-500"}`}>
                {pendingApprovalsCount > 0 ? "Action needed" : "All clear"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Runner Status</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-white">
                {isConnected ? "Cloud Online" : isConnecting ? "Connecting" : "Offline"}
              </span>
              <span className="text-[10px] font-mono text-slate-500">v1.0</span>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "fleet" && (
          <BotFleetView
            bots={bots}
            loading={loadingData}
            onSelectBotForChat={handleSelectBotForChat}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === "routines" && (
          <RoutinesManager
            routines={routines}
            runs={runs}
            loading={loadingData}
            onTriggerRoutine={handleTriggerRoutine}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "approvals" && (
          <ApprovalsInbox
            approvals={approvals}
            loading={loadingData}
            onDecide={handleDecideApproval}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "chat" && (
          <LiveChatDrawer
            bots={bots}
            selectedBotId={selectedBotForChat}
            onSelectBot={setSelectedBotForChat}
          />
        )}
      </main>

      {/* Connection Settings Modal */}
      <ConnectionModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConnectionUpdated={checkConnection}
      />
    </div>
  );
}
