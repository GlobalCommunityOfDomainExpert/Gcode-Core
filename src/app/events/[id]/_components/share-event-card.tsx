"use client";

import { useState } from "react";
import { Button } from "@/components/atoms";

export function ShareEventCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border-light bg-surface-light p-4">
      <p className="text-small font-bold uppercase tracking-widest text-text-secondary">Share Event</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, "_blank")
          }
        >
          Twitter / X
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
              "_blank"
            )
          }
        >
          LinkedIn
        </Button>
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
}
