import { NextResponse } from "next/server";

// Trusted clock for "has this event ended" checks — deliberately the Next.js
// server's own clock, not the browser's, since a client's system clock can
// be wrong or manipulated.
export async function GET() {
  return NextResponse.json({ now: new Date().toISOString() });
}
