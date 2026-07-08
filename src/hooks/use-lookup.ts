"use client";

import { useEffect, useState } from "react";

export type LookupStatus = "loading" | "error" | "ready";

export interface UseLookupResult<T> {
  status: LookupStatus;
  data: T[];
}

// Wraps a cached lookup fetcher (see src/lib/api/lookups.ts) with
// loading/error state. The fetcher's own promise memoization means mounting
// this hook after something else already warmed the cache resolves instantly.
export function useLookup<T>(fetcher: () => Promise<T[]>): UseLookupResult<T> {
  const [status, setStatus] = useState<LookupStatus>("loading");
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setStatus("loading");
      try {
        const items = await fetcher();
        if (cancelled) return;
        setData(items);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  return { status, data };
}
