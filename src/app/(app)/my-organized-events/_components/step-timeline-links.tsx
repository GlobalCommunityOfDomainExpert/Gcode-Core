"use client";

import {
  Button,
  Card,
  Input,
  RemoveIconButton,
  SectionLabel,
  Textarea,
} from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { EventTimelineItem, EventSocialLink } from "@/lib/event";
import { UpdateEventDetailData, EventDetailData } from "@/lib/zod/event";

function withAddedItem<T>(list: T[], item: T): T[] {
  return [...list, item];
}

function withUpdatedItem<T>(
  list: T[],
  index: number,
  updater: (item: T) => T,
): T[] {
  return list.map((item, itemIndex) =>
    itemIndex === index ? updater(item) : item,
  );
}

function withRemovedItem<T>(list: T[], index: number): T[] {
  return list.filter((_, itemIndex) => itemIndex !== index);
}

export interface StepTimelineLinksProps {
  data: EventDetailData;
  onChange: UpdateEventDetailData;
}

export function StepTimelineLinks({ data, onChange }: StepTimelineLinksProps) {
  function addTimelineItem() {
    onChange(
      "timeline",
      withAddedItem(data.timeline, {
        date: data.date || "",
        time: "",
        endTime: "",
        title: "",
        description: "",
        location: "",
      }),
    );
  }

  function updateTimelineItem(
    index: number,
    field: keyof EventTimelineItem,
    value: string,
  ) {
    onChange(
      "timeline",
      withUpdatedItem(data.timeline, index, (item) => ({
        ...item,
        [field]: value,
      })),
    );
  }

  function removeTimelineItem(index: number) {
    onChange("timeline", withRemovedItem(data.timeline, index));
  }

  function addSocialLink() {
    onChange(
      "socialLinks",
      withAddedItem(data.socialLinks, { platform: "", url: "" }),
    );
  }

  function updateSocialLink(
    index: number,
    field: keyof EventSocialLink,
    value: string,
  ) {
    onChange(
      "socialLinks",
      withUpdatedItem(data.socialLinks, index, (link) => ({
        ...link,
        [field]: value,
      })),
    );
  }

  function removeSocialLink(index: number) {
    onChange("socialLinks", withRemovedItem(data.socialLinks, index));
  }

  function addMediaUrl() {
    onChange("mediaUrls", withAddedItem(data.mediaUrls, ""));
  }

  function updateMediaUrl(index: number, value: string) {
    onChange(
      "mediaUrls",
      withUpdatedItem(data.mediaUrls, index, () => value),
    );
  }

  function removeMediaUrl(index: number) {
    onChange("mediaUrls", withRemovedItem(data.mediaUrls, index));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Timeline &amp; links
        </h2>
        <p className="text-body text-text-secondary">
          Optional — both help attendees know what to expect. Skip either if you
          don&apos;t need them.
        </p>
      </div>

      <div className="space-y-3">
        <SectionLabel>Timeline</SectionLabel>
        {data.timeline.map((item, index) => (
          <Card key={index} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-body text-text-primary font-semibold">
                Item {index + 1}
              </p>
              <RemoveIconButton
                onClick={() => removeTimelineItem(index)}
                ariaLabel={`Remove timeline item ${index + 1}`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Date" htmlFor={`timeline-date-${index}`}>
                <Input
                  id={`timeline-date-${index}`}
                  type="date"
                  value={item.date}
                  onChange={(event) =>
                    updateTimelineItem(index, "date", event.target.value)
                  }
                />
              </FormField>
              <FormField label="Start" htmlFor={`timeline-time-${index}`}>
                <Input
                  id={`timeline-time-${index}`}
                  type="time"
                  value={item.time}
                  onChange={(event) =>
                    updateTimelineItem(index, "time", event.target.value)
                  }
                />
              </FormField>
              <FormField label="End" htmlFor={`timeline-endtime-${index}`}>
                <Input
                  id={`timeline-endtime-${index}`}
                  type="time"
                  value={item.endTime}
                  onChange={(event) =>
                    updateTimelineItem(index, "endTime", event.target.value)
                  }
                />
              </FormField>
            </div>
            <FormField label="Title" htmlFor={`timeline-title-${index}`}>
              <Input
                id={`timeline-title-${index}`}
                value={item.title}
                onChange={(event) =>
                  updateTimelineItem(index, "title", event.target.value)
                }
                placeholder="e.g. Kickoff & Problem Statement"
              />
            </FormField>
            <FormField label="Location" htmlFor={`timeline-location-${index}`}>
              <Input
                id={`timeline-location-${index}`}
                value={item.location}
                onChange={(event) =>
                  updateTimelineItem(index, "location", event.target.value)
                }
                placeholder="e.g. Main Hall (optional)"
              />
            </FormField>
            <FormField
              label="Description"
              htmlFor={`timeline-description-${index}`}
            >
              <Textarea
                id={`timeline-description-${index}`}
                value={item.description}
                onChange={(event) =>
                  updateTimelineItem(index, "description", event.target.value)
                }
                placeholder="What happens in this slot?"
                rows={2}
              />
            </FormField>
          </Card>
        ))}
        <Button variant="secondary" size="sm" onClick={addTimelineItem}>
          + Add timeline item
        </Button>
      </div>

      <div className="border-border-light space-y-3 border-t pt-6">
        <SectionLabel>Social links</SectionLabel>
        {data.socialLinks.map((link, index) => (
          <Card key={index} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-body text-text-primary font-semibold">
                Link {index + 1}
              </p>
              <RemoveIconButton
                onClick={() => removeSocialLink(index)}
                ariaLabel={`Remove social link ${index + 1}`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Platform" htmlFor={`social-platform-${index}`}>
                <Input
                  id={`social-platform-${index}`}
                  value={link.platform}
                  onChange={(event) =>
                    updateSocialLink(index, "platform", event.target.value)
                  }
                  placeholder="e.g. Twitter, Discord, Website"
                />
              </FormField>
              <FormField label="URL" htmlFor={`social-url-${index}`}>
                <Input
                  id={`social-url-${index}`}
                  type="url"
                  value={link.url}
                  onChange={(event) =>
                    updateSocialLink(index, "url", event.target.value)
                  }
                  placeholder="https://..."
                />
              </FormField>
            </div>
          </Card>
        ))}
        <Button variant="secondary" size="sm" onClick={addSocialLink}>
          + Add link
        </Button>
      </div>

      <div className="border-border-light space-y-3 border-t pt-6">
        <SectionLabel>Media</SectionLabel>
        {data.mediaUrls.map((url, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <FormField
                label={`Media URL ${index + 1}`}
                htmlFor={`media-url-${index}`}
              >
                <Input
                  id={`media-url-${index}`}
                  type="url"
                  value={url}
                  onChange={(event) =>
                    updateMediaUrl(index, event.target.value)
                  }
                  placeholder="https://..."
                />
              </FormField>
            </div>
            <RemoveIconButton
              onClick={() => removeMediaUrl(index)}
              ariaLabel={`Remove media URL ${index + 1}`}
              size="md"
            />
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addMediaUrl}>
          + Add media link
        </Button>
      </div>
    </div>
  );
}
