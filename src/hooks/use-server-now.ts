"use client";

import { useEffect, useReducer } from "react";
import { ensureServerTimeSynced, serverNow } from "@/lib/server-time";

export function useServerNow(): Date {
  const [, forceRender] = useReducer((c) => c + 1, 0);
  useEffect(() => {
    let cancelled = false;
    ensureServerTimeSynced().then(() => {
      if (!cancelled) forceRender();
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return serverNow();
}
