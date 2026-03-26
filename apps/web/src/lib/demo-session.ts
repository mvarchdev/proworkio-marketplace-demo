"use client";

const demoSessionKey = "proworkio-demo-session";

export interface DemoSession {
  role: "customer" | "company";
  email: string;
  fullName?: string;
}

export function readDemoSession(): DemoSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(demoSessionKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function writeDemoSession(session: DemoSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(demoSessionKey, JSON.stringify(session));
}

export function clearDemoSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(demoSessionKey);
}

