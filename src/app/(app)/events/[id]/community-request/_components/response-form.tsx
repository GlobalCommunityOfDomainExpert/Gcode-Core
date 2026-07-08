"use client";

import { useState } from "react";
import { Button, Card, SectionLabel, Textarea } from "@/components/atoms";
import { Banner } from "@/components/molecules";
import { CommunityRequestStatus } from "@/lib/community-requests";
import { respondToCommunityRequest } from "@/lib/api/community";

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
  const [submitting, setSubmitting] = useState(false);

  async function respond(next: "interested" | "passed") {
    setSubmitting(true);
    try {
      await respondToCommunityRequest(requestId, next, note);
      onRespond(next, new Date().toISOString());
    } catch (error) {
      console.error("Failed to submit response", error);
      setSubmitting(false);
    }
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
    <Card padding="md" className="space-y-3">
      <SectionLabel>Your Response</SectionLabel>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Share your availability, what you can offer, questions you have..."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          className="flex-1"
          loading={submitting}
          onClick={() => respond("interested")}
        >
          ✓ I&apos;m Interested
        </Button>
        <Button
          variant="danger-ghost"
          className="border-danger/30 flex-1 border"
          disabled={submitting}
          onClick={() => respond("passed")}
        >
          ✗ Pass
        </Button>
      </div>
      <p className="text-small text-text-secondary text-center">
        Marking interested means the organizer will follow up to confirm your
        role.
      </p>
    </Card>
  );
}
