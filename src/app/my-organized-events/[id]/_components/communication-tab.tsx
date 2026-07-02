"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@/components/atoms";
import { Chip, FormField, Modal } from "@/components/molecules";
import { Attendee } from "@/lib/attendees";
import {
  addCommunicationLog,
  getCommunicationLogsByEvent,
} from "@/lib/communications";
import { MockEvent } from "@/lib/mock-events";

export interface CommunicationTabProps {
  event: MockEvent;
  attendees: Attendee[];
  selectedIds: Set<string>;
}

type RecipientMode = "all" | "confirmed" | "paid" | "custom";

const templates: {
  key: string;
  label: string;
  subject: (event: MockEvent) => string;
  body: (event: MockEvent) => string;
  disabled?: (event: MockEvent) => boolean;
}[] = [
  {
    key: "reminder",
    label: "📅 Reminder",
    subject: (event) => `Reminder: ${event.title} is coming up`,
    body: (event) =>
      `Hi there,\n\nJust a reminder that ${event.title} is happening on ${event.date} at ${event.time}.\n\nSee you there!`,
  },
  {
    key: "link",
    label: "🔗 Joining Link",
    subject: (event) => `Your joining link for ${event.title}`,
    body: (event) =>
      `Hi there,\n\nYour event is starting soon! Here is where to find it:\n\n${event.location}\n\nSee you there!`,
  },
  {
    key: "cert",
    label: "🎓 Certificate Ready",
    subject: (event) => `Your certificate for ${event.title} is ready`,
    body: (event) =>
      `Hi there,\n\nCongratulations on completing ${event.title}!\n\nYour certificate is ready to download from your My Events page.`,
    disabled: (event) => !event.certificate,
  },
  {
    key: "thanks",
    label: "🙏 Thank You",
    subject: (event) => `Thanks for joining ${event.title}`,
    body: () =>
      `Hi there,\n\nThank you for joining! We hope it was valuable.\n\nWe'd love your feedback — see you at the next one!`,
  },
];

export function CommunicationTab({
  event,
  attendees,
  selectedIds,
}: CommunicationTabProps) {
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [logs, setLogs] = useState(() => getCommunicationLogsByEvent(event.id));

  const recipientCounts: Record<RecipientMode, number> = {
    all: attendees.filter((a) => a.status !== "cancelled").length,
    confirmed: attendees.filter(
      (a) => a.status === "registered" || a.status === "attended",
    ).length,
    paid: attendees.filter((a) => a.ticketType === "Paid").length,
    custom: selectedIds.size,
  };

  function applyTemplate(template: (typeof templates)[number]) {
    setSubject(template.subject(event));
    setMessage(template.body(event));
  }

  function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    const log = addCommunicationLog({
      eventId: event.id,
      subject: subject.trim(),
      message: message.trim(),
      recipientCount: recipientCounts[recipientMode],
      openRate: undefined,
    });
    setLogs((prev) => [log, ...prev]);
    setSubject("");
    setMessage("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div>
          <p className="text-small text-text-secondary mb-2 block font-semibold">
            Send To <span className="text-danger">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip
              selected={recipientMode === "all"}
              onClick={() => setRecipientMode("all")}
            >
              All Registered ({recipientCounts.all})
            </Chip>
            <Chip
              selected={recipientMode === "confirmed"}
              onClick={() => setRecipientMode("confirmed")}
            >
              Confirmed only ({recipientCounts.confirmed})
            </Chip>
            <Chip
              selected={recipientMode === "paid"}
              onClick={() => setRecipientMode("paid")}
            >
              Paid only ({recipientCounts.paid})
            </Chip>
            <Chip
              selected={recipientMode === "custom"}
              onClick={() => selectedIds.size > 0 && setRecipientMode("custom")}
              disabled={selectedIds.size === 0}
              title={
                selectedIds.size === 0
                  ? "Select attendees from the Attendees tab first"
                  : undefined
              }
            >
              Custom selection ({recipientCounts.custom})
            </Chip>
          </div>
        </div>

        <div>
          <p className="text-small text-text-secondary mb-2 block font-semibold">
            Quick Templates
          </p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <Button
                key={template.key}
                type="button"
                variant="secondary"
                size="sm"
                disabled={template.disabled?.(event)}
                onClick={() => applyTemplate(template)}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        <FormField label="Subject" htmlFor="email-subject" required>
          <Input
            id="email-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Enter email subject…"
          />
        </FormField>

        <FormField
          label="Message"
          htmlFor="email-body"
          required
          hint="Templates fill this in automatically — feel free to edit before sending."
        >
          <Textarea
            id="email-body"
            rows={6}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write your message to attendees…"
          />
        </FormField>

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!subject.trim() || !message.trim()}
          >
            📧 Send Now
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPreviewOpen(true)}
            disabled={!subject.trim() && !message.trim()}
          >
            Preview
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <p className="text-small text-text-secondary mb-3 flex items-center gap-2 font-bold tracking-widest uppercase">
          Sent History <span className="bg-border-light h-px flex-1" />
        </p>
        <div className="flex flex-col gap-3">
          {logs.length === 0 ? (
            <p className="text-small text-text-secondary italic">
              No emails sent yet.
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border-border-light bg-bg-light rounded-md border p-3"
              >
                <p className="text-small text-text-primary mb-0.5 font-bold">
                  {log.subject}
                </p>
                <p className="text-small text-text-secondary mb-2">
                  {new Date(log.sentAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <div className="text-small flex items-center justify-between">
                  <span className="text-text-secondary">
                    {log.recipientCount} recipients
                  </span>
                  {log.openRate !== undefined && (
                    <span className="text-success font-semibold">
                      {log.openRate}% opened
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview"
      >
        <div className="space-y-2">
          <p className="text-body text-text-primary font-semibold">
            {subject || "(no subject)"}
          </p>
          <p className="text-body text-text-secondary whitespace-pre-line">
            {message || "(no message)"}
          </p>
        </div>
      </Modal>
    </div>
  );
}
