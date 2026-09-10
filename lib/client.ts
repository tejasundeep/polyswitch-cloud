export interface Bot {
  id: string;
  name: string;
  description?: string;
  model: string;
  providerInstanceId: string;
  driverKind?: string;
  avatar?: string;
  system?: string;
  enabled?: boolean;
  threadId: string;
}

export interface RoutineSchedule {
  type: "cron" | "interval" | "once";
  cron?: string;
  intervalMs?: number;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  botId: string;
  prompt: string;
  schedule: RoutineSchedule;
  enabled: boolean;
  status: "idle" | "running" | "error";
  lastRunAt?: number;
  nextRunAt?: number | null;
  lastDeliverable?: string;
}

export interface RoutineLogEntry {
  at: number;
  message: string;
  level?: "info" | "warn" | "error";
}

export interface RoutineRun {
  id: string;
  routineId: string;
  botId: string;
  startedAt: number;
  finishedAt?: number;
  status: "running" | "completed" | "failed";
  durationMs?: number;
  deliverable?: string;
  logs: RoutineLogEntry[];
}

export interface ApprovalRequest {
  id: string;
  requestId?: string;
  tool: string;
  summary: string;
  choices?: string[];
  state: "open" | "resolved" | "rejected";
  threadId?: string;
  createdAt: string;
  risk?: "low" | "medium" | "high" | "critical";
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot" | "assistant" | "system";
  kind: "text" | "tool_call" | "tool_result" | "reasoning";
  text?: string;
  createdAt: number;
  stopReason?: string | null;
}

const DEFAULT_RUNNER_URL = "http://localhost:8799";

export function getStoredConnection(): { url: string; token: string } {
  if (typeof window === "undefined") {
    return {
      url: process.env.POLYSWITCH_RUNNER_URL || DEFAULT_RUNNER_URL,
      token: process.env.POLYSWITCH_AUTH_TOKEN || "",
    };
  }
  const url = localStorage.getItem("polyswitch_runner_url") || DEFAULT_RUNNER_URL;
  const token = localStorage.getItem("polyswitch_auth_token") || "";
  return { url: url.replace(/\/+$/, ""), token };
}

export function setStoredConnection(url: string, token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("polyswitch_runner_url", url.replace(/\/+$/, ""));
  localStorage.setItem("polyswitch_auth_token", token.trim());
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { url, token } = getStoredConnection();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Use the Next.js API proxy to avoid browser CORS issues when connecting across hosts
  const proxyUrl = `/api/proxy${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const res = await fetch(proxyUrl, {
    ...options,
    headers: {
      ...headers,
      "x-target-runner": url,
    },
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson?.error) errMsg = errJson.error;
    } catch { /* Ignore parse error */ }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export async function testConnection(customUrl?: string, customToken?: string): Promise<{ ok: boolean; message: string; version?: string }> {
  try {
    const targetUrl = (customUrl || getStoredConnection().url).replace(/\/+$/, "");
    const token = customToken !== undefined ? customToken : getStoredConnection().token;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-target-runner": targetUrl,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/proxy/api/health", {
      headers,
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { 
        ok: true, 
        message: "Connected to Polyswitch runner successfully",
        version: data?.app ? `${data.app} (pid: ${data.pid})` : undefined
      };
    }
    return { ok: false, message: `Runner responded with HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Failed to connect to Polyswitch runner" };
  }
}

export async function fetchBots(): Promise<Bot[]> {
  try {
    const data = await apiRequest<{ bots?: any[]; instances?: any }>("/api/bots");
    if (data.bots && Array.isArray(data.bots)) {
      return data.bots.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description || b.title,
        model: b.modelSelection?.model || b.model || b.modelSelection?.instanceId || "default",
        providerInstanceId: b.modelSelection?.instanceId || b.providerInstanceId || "claude",
        driverKind: b.modelSelection?.instanceId || b.driverKind || "claudeAgent",
        avatar: b.avatar,
        system: b.system,
        enabled: b.enabled !== false,
        threadId: b.threadId || b.id,
      }));
    }
    return [];
  } catch {
    // Fallback attempt to get config/instances
    const cfg = await apiRequest<{ instances?: Record<string, any> }>("/api/instances");
    if (cfg?.instances) {
      return Object.entries(cfg.instances).map(([id, conf]: [string, any]) => ({
        id,
        name: conf.displayName || id.toUpperCase(),
        model: conf.driver || "default",
        providerInstanceId: id,
        driverKind: conf.driver,
        threadId: id,
        enabled: conf.enabled !== false,
      }));
    }
    return [];
  }
}

export async function fetchRoutines(): Promise<{ routines: Routine[]; runs: RoutineRun[] }> {
  const data = await apiRequest<{ routines?: Routine[]; runs?: RoutineRun[] }>("/api/routines");
  return {
    routines: data.routines || [],
    runs: data.runs || [],
  };
}

export async function triggerRoutine(routineId: string): Promise<{ ok: boolean; message: string }> {
  return apiRequest<{ ok: boolean; message: string }>(`/api/routines/${routineId}/trigger`, {
    method: "POST",
  });
}

export async function createRoutine(routine: {
  name: string;
  description?: string;
  botId: string;
  prompt: string;
  schedule: RoutineSchedule;
}): Promise<{ routine: Routine }> {
  return apiRequest<{ routine: Routine }>("/api/routines", {
    method: "POST",
    body: JSON.stringify(routine),
  });
}

export async function deleteRoutine(routineId: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/routines/${routineId}`, {
    method: "DELETE",
  });
}

export async function fetchApprovals(): Promise<ApprovalRequest[]> {
  try {
    const data = await apiRequest<{ approvals?: any[] }>("/api/approvals");
    if (data.approvals && Array.isArray(data.approvals)) {
      return data.approvals.map((item) => ({
        id: item.id,
        requestId: item.metadata?.requestId || item.id,
        tool: item.source || "action",
        summary: item.detail || item.title || "Approval required",
        state: item.status === "pending" ? "open" : (item.status === "approved" ? "resolved" : "rejected"),
        threadId: item.metadata?.threadId,
        createdAt: item.createdAt || Date.now(),
        risk: "medium",
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function decideApproval(approvalId: string, approved: boolean): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/approvals/${encodeURIComponent(approvalId)}`, {
    method: "POST",
    body: JSON.stringify({ decision: approved ? "approve" : "deny" }),
  });
}

export async function fetchThreadMessages(threadId: string): Promise<ChatMessage[]> {
  try {
    const data = await apiRequest<{ messages?: ChatMessage[] }>(`/api/chats/${threadId}`);
    return data.messages || [];
  } catch {
    return [];
  }
}

export async function sendChatMessage(botId: string, text: string): Promise<{ ok: boolean; response?: string }> {
  return apiRequest<{ ok: boolean; response?: string }>(`/api/chats/${botId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
