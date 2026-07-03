"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge, Button, Icon, Input } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { MockEvent } from "@/lib/mock-events";

export interface SettingsTabProps {
  event: MockEvent;
  onSave: (updates: Partial<MockEvent>) => void;
  onRequestCancel: () => void;
}

export function SettingsTab({
  event,
  onSave,
  onRequestCancel,
}: SettingsTabProps) {
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [capacity, setCapacity] = useState(
    event.capacity ? String(event.capacity) : "",
  );
  const [tags, setTags] = useState<string[]>(event.tags ?? []);
  const [newTag, setNewTag] = useState("");
  const [saved, setSaved] = useState(false);

  function addTag() {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags([...tags, trimmed]);
    setNewTag("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleSave() {
    onSave({
      title,
      date,
      time,
      capacity: capacity ? Number(capacity) : undefined,
      tags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <p className="text-small text-text-secondary mb-4 flex items-center gap-2 font-bold tracking-widest uppercase">
          Event Details <span className="bg-border-light h-px flex-1" />
        </p>

        <div className="flex flex-col gap-4">
          <FormField label="Event Title" htmlFor="settings-title">
            <Input
              id="settings-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" htmlFor="settings-date">
              <Input
                id="settings-date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </FormField>
            <FormField label="Start Time" htmlFor="settings-time">
              <Input
                id="settings-time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label="Max Attendees"
            htmlFor="settings-capacity"
            hint="Leave blank for unlimited."
          >
            <Input
              id="settings-capacity"
              type="number"
              min={0}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="w-40"
            />
          </FormField>

          <div>
            <p className="text-body text-text-secondary mb-1.5 block font-semibold">
              Category Tags
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="solid"
                  tone="neutral"
                  size="md"
                  className="gap-1.5 pr-1.5"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="rounded-full hover:opacity-70"
                  >
                    <Icon icon={X} size="sm" />
                  </button>
                </Badge>
              ))}
              <Input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag…"
                size="sm"
                className="w-28"
              />
              <Button type="button" variant="ghost" size="xs" onClick={addTag}>
                + Add
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
            {saved && (
              <span className="text-small text-success font-semibold">
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {event.status !== "cancelled" && (
        <div className="mt-4">
          <p className="text-small text-danger mb-3 flex items-center gap-2 font-bold tracking-widest uppercase">
            Danger Zone <span className="bg-danger-light h-px flex-1" />
          </p>
          <div className="bg-danger-light border-danger/30 flex items-center justify-between gap-4 rounded-md border p-4">
            <div>
              <p className="text-body text-danger font-bold">
                Cancel this event
              </p>
              <p className="text-small text-danger/80 mt-0.5">
                All registered attendees will be notified. This cannot be
                undone.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={onRequestCancel}
              className="shrink-0 whitespace-nowrap"
            >
              Cancel Event
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
