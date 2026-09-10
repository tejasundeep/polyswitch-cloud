"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot as BotIcon, User, Terminal, Loader2, Sparkles, RefreshCw } from "lucide-react";
import type { Bot, ChatMessage } from "../lib/client";
import { fetchThreadMessages, sendChatMessage } from "../lib/client";

interface LiveChatDrawerProps {
  bots: Bot[];
  selectedBotId: string | null;
  onSelectBot: (botId: string) => void;
}

export function LiveChatDrawer({ bots, selectedBotId, onSelectBot }: LiveChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeBot = bots.find((b) => b.id === selectedBotId) || bots[0] || null;

  useEffect(() => {
    if (activeBot) {
      loadMessages(activeBot.threadId || activeBot.id);
    }
  }, [activeBot?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function loadMessages(threadId: string) {
    try {
      setLoadingMessages(true);
      const msgs = await fetchThreadMessages(threadId);
      setMessages(msgs);
    } catch {
      // Fallback
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeBot || sending) return;

    const userText = input.trim();
    setInput("");

    // Optimistic local add
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      kind: "text",
      text: userText,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await sendChatMessage(activeBot.id, userText);
      if (res.response) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "bot",
          kind: "text",
          text: res.response,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Refresh messages from server
        setTimeout(() => {
          loadMessages(activeBot.threadId || activeBot.id);
        }, 1500);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "system",
        kind: "text",
        text: `Error: ${err?.message || "Failed to deliver message"}`,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  if (!activeBot) {
    return (
      <div className="flex min-h-[350px] items-center justify-center text-slate-500 text-xs">
        No active bot available for chat.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] flex-col rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Bot Selector Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300">
            <BotIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{activeBot.name}</span>
              <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-slate-700">
                {activeBot.model}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Driver: {activeBot.driverKind || activeBot.providerInstanceId}
            </p>
          </div>
        </div>

        {/* Dropdown to switch bots */}
        <div className="flex items-center gap-2">
          <select
            value={activeBot.id}
            onChange={(e) => onSelectBot(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            {bots.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.model})
              </option>
            ))}
          </select>

          <button
            onClick={() => loadMessages(activeBot.threadId || activeBot.id)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition-colors"
            title="Refresh conversation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {loadingMessages && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
            <BotIcon className="h-8 w-8 text-slate-600 mb-2" />
            <p className="font-medium text-slate-400">Start a conversation with {activeBot.name}</p>
            <p className="mt-1 max-w-xs text-[11px] text-slate-500">
              Send prompts or instructions directly to the bot running on your cloud runner.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            const isSystem = msg.role === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2 text-[11px] text-slate-500 font-mono">
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                    <BotIcon className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs shadow-md ${
                    isUser
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none"
                      : "bg-slate-950/90 border border-slate-800 text-slate-200 rounded-bl-none font-normal leading-relaxed"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
              <BotIcon className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-3.5 rounded-bl-none text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              <span>{activeBot.name} is thinking & executing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSend} className="border-t border-slate-800 bg-slate-950/80 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${activeBot.name}...`}
            disabled={sending}
            className="flex-1 bg-transparent py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 transition-all shrink-0"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
