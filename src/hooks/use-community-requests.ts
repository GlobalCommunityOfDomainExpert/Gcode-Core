"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listCommunityRequests,
  createCommunityRequests,
  remindCommunityRequest,
  respondToCommunityRequest,
  deleteCommunityRequest,
} from "@/lib/api/community";
import { adaptCommunityRequest } from "@/lib/api/adapters";
import { CommunityRequest } from "@/lib/community-requests";
import { SelectedStakeholder } from "@/lib/zod/event";

type FetchStatus = "loading" | "error" | "ready";

// Fetches + mutates the community requests for one event. Mutations re-fetch
// so the list always reflects DB state.
export function useCommunityRequests(eventId: string | undefined) {
  const [requests, setRequests] = useState<CommunityRequest[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");

  const refresh = useCallback(async () => {
    if (!eventId) return;
    try {
      const rows = await listCommunityRequests(eventId);
      setRequests(rows.map(adaptCommunityRequest));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [eventId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  const addRequests = useCallback(
    async (selected: SelectedStakeholder[]) => {
      if (!eventId || selected.length === 0) return;
      await createCommunityRequests(
        eventId,
        selected.map((s) => ({
          stakeholderId: s.stakeholderId,
          category: s.category,
          message: s.message,
        })),
      );
      await refresh();
    },
    [eventId, refresh],
  );

  const nudge = useCallback(
    async (id: string) => {
      await remindCommunityRequest(id);
      await refresh();
    },
    [refresh],
  );

  const confirm = useCallback(
    async (id: string) => {
      await respondToCommunityRequest(id, "helping", "");
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteCommunityRequest(id);
      await refresh();
    },
    [refresh],
  );

  return { requests, status, addRequests, nudge, confirm, remove, refresh };
}
