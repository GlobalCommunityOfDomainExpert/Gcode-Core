"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/atoms";
import { Banner } from "@/components/molecules";
import { CommunityRequestStatus } from "@/lib/community-requests";
import { useCommunityRequestsStore } from "@/store/community-requests-store";

export interface ResponseFormProps {
  requestId: string;
  status: CommunityRequestStatus;
  respondedAt?: string;
  responseMessage?: string;
  onRespond: (status: CommunityRequestStatus, respondedAt: string) => void;
}

export function ResponseForm({
  requestId,
  status,
  respondedAt,
  responseMessage,
  onRespond,
}: ResponseFormProps) {
  const [note, setNote] = useState(responseMessage ?? "");
  const respondToRequest = useCommunityRequestsStore(
    (state) => state.respondToRequest,
  );

  function respond(next: "interested" | "passed") {
    const updated = respondToRequest(requestId, next, note);
    onRespond(next, updated?.respondedAt ?? new Date().toISOString());
  }

  if (status === "helping") {
    return (
      <Banner tone="success">
        <p className="font-semibold">
          You&apos;re confirmed as helping with this event.
        </p>
        {note && (
          <p className="text-body mt-1">Your message: &ldquo;{note}&rdquo;</p>
        )}
      </Banner>
    );
  }

  if (respondedAt) {
    return (
      <Banner tone={status === "interested" ? "success" : "danger"}>
        <p className="font-semibold">
          {status === "interested"
            ? "You're interested — the organizer will follow up."
            : "You passed on this request."}
        </p>
        {note && (
          <p className="text-body mt-1">Your message: &ldquo;{note}&rdquo;</p>
        )}
      </Banner>
    );
  }

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
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => respond("interested")}
        >
          ✓ I&apos;m Interested
        </Button>
        <Button
          variant="danger-ghost"
          className="border-danger/30 flex-1 border"
          onClick={() => respond("passed")}
        >
          ✗ Pass
        </Button>
      </div>
      <p className="text-small text-text-secondary text-center">
        Marking interested means the organizer will follow up to confirm your
        role.
      </p>
    </div>
  );
}
