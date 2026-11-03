import { NextResponse } from "next/server";

export function handleApiError(error: unknown, fallbackMessage = "Request failed") {
  const message = error instanceof Error ? error.message : fallbackMessage;
  if (message.includes("MISSING_API_KEY")) {
    return NextResponse.json({ error: message, code: "MISSING_API_KEY" }, { status: 401 });
  }
  if (message.includes("INSUFFICIENT_CREDITS")) {
    return NextResponse.json({ error: message, code: "INSUFFICIENT_CREDITS" }, { status: 402 });
  }
  if (message.includes("AUTH_REQUIRED")) {
    return NextResponse.json({ error: message, code: "AUTH_REQUIRED" }, { status: 403 });
  }
  console.error("API Error:", error);
  return NextResponse.json({ error: message }, { status: 500 });
}
