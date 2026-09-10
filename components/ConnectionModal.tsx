"use client";

import React, { useState, useEffect } from "react";
import { X, Server, Key, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { getStoredConnection, setStoredConnection, testConnection } from "../lib/client";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionUpdated: () => void;
}

export function ConnectionModal({ isOpen, onClose, onConnectionUpdated }: ConnectionModalProps) {
  const [url, setUrl] = useState("http://localhost:8799");
  const [token, setToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredConnection();
      setUrl(stored.url);
      setToken(stored.token);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const res = await testConnection(url, token);
    setTestResult(res);
    setTesting(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStoredConnection(url, token);
    onConnectionUpdated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Server className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Polyswitch Runner Connection</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Harness Runner Endpoint URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8799 or https://your-runner.fly.dev"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              For local dev use <code className="text-cyan-300">http://localhost:8799</code>. For cloud runners use your VPS or Fly.io domain.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Auth Bearer Token <span className="text-slate-500">(Optional for local)</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Key className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="PSB_AUTH_TOKEN secret"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2.5 rounded-xl p-3 text-xs ${
                testResult.ok
                  ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
                  : "bg-rose-950/40 border border-rose-800/60 text-rose-300"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Test Ping
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
