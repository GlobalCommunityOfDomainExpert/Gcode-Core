import { NextRequest } from "next/server";
import { listReactionsSince } from "@/lib/api/ratings";
import { getEvent } from "@/lib/api/events";
import { generateBotReactions } from "@/lib/reactions/bot-simulator";

const POLL_MS = 700;

// Separate from live-performer/stream's route on purpose — that one is a
// diff-based state-sync (only pushes on scalar-field change), while
// reactions are an append-only event log (push whenever there's something
// new). Cramming both models into one route would either break the state
// route's "only send on change" optimization or fight over two different
// polling cadences in one loop. Polls faster (700ms vs 2000ms) since taps
// are meant to feel snappy, closer to a live chat than a state sync.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const performerId = request.nextUrl.searchParams.get("performer_id");
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let sinceId = 0;
      // Fetched once per connection, not per tick — registered-attendee
      // count doesn't change fast enough to justify re-fetching every 700ms.
      let registeredCount = 0;
      try {
        const event = await getEvent(id);
        registeredCount = event?.registered_count ?? 0;
      } catch {
        // best-effort — bot rate just defaults to 0 if this fails
      }

      request.signal.addEventListener("abort", () => {
        closed = true;
      });

      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      while (!closed) {
        if (!performerId) {
          await new Promise((resolve) => setTimeout(resolve, POLL_MS));
          continue;
        }
        try {
          const items = await listReactionsSince(id, performerId, sinceId);
          if (items.length > 0) sinceId = items[items.length - 1].id;
          const bots = generateBotReactions(registeredCount, POLL_MS);
          if (items.length > 0 || bots.length > 0) {
            send({
              performer_participant_id: Number(performerId),
              items: items.map((i) => ({ id: i.id, emoji: i.emoji })),
              bots,
            });
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
