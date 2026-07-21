import { NextRequest } from "next/server";
import { getLivePerformer } from "@/lib/api/ratings";

const POLL_MS = 2000;
const HEARTBEAT_MS = 15000;

// No websocket/SSE infra exists in this repo — this route polls ORDS
// server-side and only pushes to the browser when the current performer
// actually changes, so the attendee page gets push-like updates via a plain
// EventSource without hammering ORDS directly from the client.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const attendeeId = request.nextUrl.searchParams.get("attendee_id") ?? undefined;
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let lastParticipantId: number | null | undefined = undefined;
      let lastAlreadyRated: boolean | undefined = undefined;
      let lastRatingCount: number | undefined = undefined;
      let lastWindowClosesAt: string | null | undefined = undefined;
      let lastHeartbeat = Date.now();

      request.signal.addEventListener("abort", () => {
        closed = true;
      });

      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      while (!closed) {
        try {
          const state = await getLivePerformer(id, attendeeId);
          if (
            state.participant_id !== lastParticipantId ||
            state.already_rated !== lastAlreadyRated ||
            state.rating_count !== lastRatingCount ||
            state.window_closes_at !== lastWindowClosesAt
          ) {
            lastParticipantId = state.participant_id;
            lastAlreadyRated = state.already_rated;
            lastRatingCount = state.rating_count;
            lastWindowClosesAt = state.window_closes_at;
            send(state);
            lastHeartbeat = Date.now();
          } else if (Date.now() - lastHeartbeat > HEARTBEAT_MS) {
            send(state);
            lastHeartbeat = Date.now();
          }
        } catch {
          // transient ORDS/network error — skip this tick, try again next poll
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
