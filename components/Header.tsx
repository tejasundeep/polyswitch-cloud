"use client";

import React from "react";
import { Bot, ShieldCheck, Zap, MessageSquare, Settings2, Cloud } from "lucide-react";

interface HeaderProps {
  activeTab: "fleet" | "routines" | "approvals" | "chat";
  setActiveTab: (tab: "fleet" | "routines" | "approvals" | "chat") => void;
  isConnected: boolean;
  isConnecting: boolean;
  runnerUrl: string;
  pendingApprovalsCount: number;
  activeRoutinesCount: number;
  onOpenSettings: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  isConnected,
  isConnecting,
  runnerUrl,
  pendingApprovalsCount,
  activeRoutinesCount,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Connection State */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                Polyswitch <span className="text-cyan-400 font-mono text-xs uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">Cloud</span>
              </span>
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnecting
                    ? "bg-amber-400 animate-ping"
                    : isConnected
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-rose-500"
                }`}
                title={isConnected ? "Connected to Runner" : isConnecting ? "Connecting..." : "Runner Offline"}
              />
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-[280px]">
              {runnerUrl ? runnerUrl.replace(/^https?:\/\//, "") : "Not connected"}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "fleet"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Bot className="h-4 w-4" />
            Bot Fleet
          </button>

          <button
            onClick={() => setActiveTab("routines")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "routines"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Zap className="h-4 w-4" />
            Routines 2.0
            {activeRoutinesCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950">
                {activeRoutinesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "approvals"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Approvals
            {pendingApprovalsCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white animate-pulse">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "chat"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Live Chat
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
          >
            <Settings2 className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Runner Config</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-slate-800/60 bg-slate-950/90 px-2 py-1.5 justify-around">
        <button
          onClick={() => setActiveTab("fleet")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[11px] font-medium rounded-lg ${
            activeTab === "fleet" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Fleet</span>
        </button>

        <button
          onClick={() => setActiveTab("routines")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[11px] font-medium rounded-lg relative ${
            activeTab === "routines" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Routines</span>
          {activeRoutinesCount > 0 && (
            <span className="absolute top-0 right-2 h-2 w-2 rounded-full bg-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("approvals")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[11px] font-medium rounded-lg relative ${
            activeTab === "approvals" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-0 right-2 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[11px] font-medium rounded-lg ${
            activeTab === "chat" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
        </button>
      </div>
    </header>
  );
}
