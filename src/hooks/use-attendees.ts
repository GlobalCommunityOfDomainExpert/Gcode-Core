"use client";

import { useCallback, useEffect, useState } from "react";
import { listParticipants } from "@/lib/api/participants";
import { adaptParticipant } from "@/lib/api/adapters";
import { Attendee } from "@/lib/attendees";

type FetchStatus = "loading" | "error" | "ready";

// Fetches the real attendee list (GCODE_EVENT_PARTICIPANTS) for one event.
export function useAttendees(
  eventId: string | undefined,
  eventTicketPrice: number,
) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");

  const refresh = useCallback(async () => {
    if (!eventId) return;
    try {
      const rows = await listParticipants(eventId);
      setAttendees(rows.map((row) => adaptParticipant(row, eventTicketPrice)));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [eventId, eventTicketPrice]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  return { attendees, status, refresh };
}
