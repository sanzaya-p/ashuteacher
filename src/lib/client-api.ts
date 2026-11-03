"use client";

const STORAGE_API_KEY = "ashuteacher_gemini_key";
const STORAGE_MODEL = "ashuteacher_gemini_model";

type Listener = () => void;
type CreditsListener = (credits?: number) => void;

const missingKeyListeners = new Set<Listener>();
const keyUpdatedListeners = new Set<Listener>();
const authRequiredListeners = new Set<Listener>();
const paywallListeners = new Set<Listener>();
const walletUpdatedListeners = new Set<CreditsListener>();

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_API_KEY) || "";
}

export function setStoredApiKey(key: string) {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(STORAGE_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_API_KEY);
  }
  keyUpdatedListeners.forEach((fn) => fn());
}

export function getStoredModel(): string {
  if (typeof window === "undefined") return "gemini-3.8-flash";
  return localStorage.getItem(STORAGE_MODEL) || "gemini-3.8-flash";
}

export function setStoredModel(model: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_MODEL, model);
}

export function promptApiKeyModal() {
  missingKeyListeners.forEach((fn) => fn());
}

export function promptAuthModal() {
  authRequiredListeners.forEach((fn) => fn());
}

export function promptPaywallModal() {
  paywallListeners.forEach((fn) => fn());
}

export function notifyWalletUpdated(credits?: number) {
  walletUpdatedListeners.forEach((fn) => fn(credits));
}

export function subscribeMissingApiKey(fn: Listener): () => void {
  missingKeyListeners.add(fn);
  return () => {
    missingKeyListeners.delete(fn);
  };
}

export function subscribeKeyUpdated(fn: Listener): () => void {
  keyUpdatedListeners.add(fn);
  return () => {
    keyUpdatedListeners.delete(fn);
  };
}

export function subscribeAuthRequired(fn: Listener): () => void {
  authRequiredListeners.add(fn);
  return () => {
    authRequiredListeners.delete(fn);
  };
}

export function subscribePaywall(fn: Listener): () => void {
  paywallListeners.add(fn);
  return () => {
    paywallListeners.delete(fn);
  };
}

export function subscribeWalletUpdated(fn: CreditsListener): () => void {
  walletUpdatedListeners.add(fn);
  return () => {
    walletUpdatedListeners.delete(fn);
  };
}

export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const storedKey = getStoredApiKey();
  if (storedKey && !headers.has("x-gemini-api-key")) {
    headers.set("x-gemini-api-key", storedKey);
  }

  const res = await fetch(input, {
    ...init,
    headers,
  });

  const remainingHeader = res.headers.get("X-Credits-Remaining");
  if (remainingHeader !== null && !Number.isNaN(Number(remainingHeader))) {
    notifyWalletUpdated(Number(remainingHeader));
  } else if (res.ok && init.method === "POST") {
    // Refresh wallet asynchronously after JSON mutations (courses/quizzes/flashcards)
    setTimeout(() => notifyWalletUpdated(), 250);
  }

  if (res.status === 401) {
    promptApiKeyModal();
  } else if (res.status === 402) {
    promptPaywallModal();
  } else if (res.status === 403) {
    promptAuthModal();
  }

  return res;
}
