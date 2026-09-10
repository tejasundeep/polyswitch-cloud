"use client";

import React from "react";
import { Bot as BotIcon, Cpu, Sparkles, MessageSquare, Terminal, CheckCircle2 } from "lucide-react";
import type { Bot } from "../lib/client";

interface BotFleetViewProps {
  bots: Bot[];
  loading: boolean;
  onSelectBotForChat: (botId: string) => void;
  onOpenSettings: () => void;
}

export function BotFleetView({ bots, loading, onSelectBotForChat, onOpenSettings }: BotFleetViewProps) {
  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Discovering bots on runner...</p>
        </div>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
        <BotIcon className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-white">No Bots Found</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          We couldn&apos;t detect any active bots on the connected runner. Verify the runner is online and configured.
        </p>
        <button
          onClick={onOpenSettings}
          className="mt-4 rounded-xl bg-cyan-600/20 border border-cyan-500/30 px-4 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-600/30 transition-all"
        >
          Check Runner Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Active Bot Fleet
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
              {bots.length} registered
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            AI agents running continuously on your Polyswitch harness runner.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => {
          const isClaude = bot.id.toLowerCase().includes("claude");
          const isGrok = bot.id.toLowerCase().includes("grok");
          const isCodex = bot.id.toLowerCase().includes("codex") || bot.id.toLowerCase().includes("openai");

          return (
            <div
              key={bot.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-cyan-500/40 hover:bg-slate-900/90 hover:shadow-cyan-500/5"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md ${
                        isClaude
                          ? "bg-amber-600/80 border border-amber-500/50"
                          : isGrok
                          ? "bg-slate-100 text-slate-950 font-bold border border-slate-300"
                          : isCodex
                          ? "bg-emerald-600/80 border border-emerald-500/50"
                          : "bg-cyan-600/80 border border-cyan-500/50"
                      }`}
                    >
                      {bot.avatar ? (
                        <span className="text-lg">{bot.avatar}</span>
                      ) : (
                        <BotIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {bot.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Terminal className="h-3 w-3" />
                        <span>{bot.driverKind || bot.providerInstanceId}</span>
                      </div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 px-3 py-2 border border-slate-800/60 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                      Model
                    </span>
                    <span className="font-mono text-cyan-300 text-[11px] font-medium truncate max-w-[140px]">
                      {bot.model}
                    </span>
                  </div>

                  {bot.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {bot.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span className="text-[10px] text-slate-500 font-mono">ID: {bot.id}</span>
                <button
                  onClick={() => onSelectBotForChat(bot.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-600 hover:text-white px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700/60 hover:border-cyan-500 transition-all shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat with Bot
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
