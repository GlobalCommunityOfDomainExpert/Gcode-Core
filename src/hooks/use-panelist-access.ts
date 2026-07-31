"use client";

import { useEffect, useState } from "react";
import { useSession } from "./use-session";
import { listEventPanelists } from "@/lib/api/panelists";
import { adaptEventPanelist } from "@/lib/api/adapters";
import { EventPanelist } from "@/lib/event";

// Whether the signed-in user is an ACCEPTED panelist for this event — the
// gate for the /judge/[id] scoring route. No server-side enforcement behind
// this (this backend doesn't verify bearer tokens — see decideRoundStatus's
// own comment), same trust level as everything else in this app; this is a
// UI gate, not a security boundary.
export function usePanelistAccess(eventId: string | undefined) {
  const session = useSession();
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [panelist, setPanelist] = useState<EventPanelist | undefined>();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!eventId || !session) {
        if (!cancelled) setStatus("ready");
        return;
      }
      try {
        const items = await listEventPanelists(eventId);
        if (cancelled) return;
        const mine = items
          .map(adaptEventPanelist)
          .find((p) => p.userId === session.userId);
        setPanelist(mine);
      } finally {
        if (!cancelled) setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, session]);

  return {
    status,
    isAcceptedPanelist: panelist?.status === "ACCEPTED",
  };
}
