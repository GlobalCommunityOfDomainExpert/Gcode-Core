"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/atoms";

export function ResponseForm() {
  const [note, setNote] = useState("");

  return (
    <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
      <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
        Your Response
      </p>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Share your availability, what you can offer, questions you have..."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" className="flex-1">
          ✓ I&apos;m Interested — Accept
        </Button>
        <Button
          variant="danger-ghost"
          className="border-danger/30 flex-1 border"
        >
          ✗ Decline
        </Button>
      </div>
      <p className="text-small text-text-secondary text-center">
        Accepting means you&apos;re interested — the organizer still confirms
        your role before it&apos;s finalised.
      </p>
    </div>
  );
}
