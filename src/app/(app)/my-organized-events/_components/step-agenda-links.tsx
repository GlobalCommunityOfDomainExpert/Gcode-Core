"use client";

import { X } from "lucide-react";
import { Button, Icon, Input, Textarea } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { EventAgendaItem, EventSocialLink } from "@/lib/mock-events";
import { UpdateWizardData, WizardData } from "./types";

export interface StepAgendaLinksProps {
  data: WizardData;
  onChange: UpdateWizardData;
}

export function StepAgendaLinks({ data, onChange }: StepAgendaLinksProps) {
  function addAgendaItem() {
    onChange("agenda", [
      ...data.agenda,
      { time: "", title: "", description: "" },
    ]);
  }

  function updateAgendaItem(
    index: number,
    field: keyof EventAgendaItem,
    value: string,
  ) {
    onChange(
      "agenda",
      data.agenda.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeAgendaItem(index: number) {
    onChange(
      "agenda",
      data.agenda.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function addSocialLink() {
    onChange("socialLinks", [...data.socialLinks, { platform: "", url: "" }]);
  }

  function updateSocialLink(
    index: number,
    field: keyof EventSocialLink,
    value: string,
  ) {
    onChange(
      "socialLinks",
      data.socialLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link,
      ),
    );
  }

  function removeSocialLink(index: number) {
    onChange(
      "socialLinks",
      data.socialLinks.filter((_, linkIndex) => linkIndex !== index),
    );
  }

  function addMediaUrl() {
    onChange("mediaUrls", [...data.mediaUrls, ""]);
  }

  function updateMediaUrl(index: number, value: string) {
    onChange(
      "mediaUrls",
      data.mediaUrls.map((url, urlIndex) => (urlIndex === index ? value : url)),
    );
  }

  function removeMediaUrl(index: number) {
    onChange(
      "mediaUrls",
      data.mediaUrls.filter((_, urlIndex) => urlIndex !== index),
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Agenda &amp; links
        </h2>
        <p className="text-body text-text-secondary">
          Optional — both help attendees know what to expect. Skip either if you
          don&apos;t need them.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
          Agenda
        </p>
        {data.agenda.map((item, index) => (
          <div
            key={index}
            className="border-border-light space-y-2 rounded-md border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-body text-text-primary font-semibold">
                Item {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeAgendaItem(index)}
                aria-label={`Remove agenda item ${index + 1}`}
                className="text-text-secondary hover:text-danger focus-visible:ring-primary rounded-full p-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icon icon={X} size="sm" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Time" htmlFor={`agenda-time-${index}`}>
                <Input
                  id={`agenda-time-${index}`}
                  value={item.time}
                  onChange={(event) =>
                    updateAgendaItem(index, "time", event.target.value)
                  }
                  placeholder="e.g. 10:00 AM"
                />
              </FormField>
              <FormField label="Title" htmlFor={`agenda-title-${index}`}>
                <Input
                  id={`agenda-title-${index}`}
                  value={item.title}
                  onChange={(event) =>
                    updateAgendaItem(index, "title", event.target.value)
                  }
                  placeholder="e.g. Kickoff & Problem Statement"
                />
              </FormField>
            </div>
            <FormField
              label="Description"
              htmlFor={`agenda-description-${index}`}
            >
              <Textarea
                id={`agenda-description-${index}`}
                value={item.description}
                onChange={(event) =>
                  updateAgendaItem(index, "description", event.target.value)
                }
                placeholder="What happens in this slot?"
                rows={2}
              />
            </FormField>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addAgendaItem}>
          + Add agenda item
        </Button>
      </div>

      <div className="border-border-light space-y-3 border-t pt-6">
        <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
          Social links
        </p>
        {data.socialLinks.map((link, index) => (
          <div
            key={index}
            className="border-border-light space-y-2 rounded-md border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-body text-text-primary font-semibold">
                Link {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                aria-label={`Remove social link ${index + 1}`}
                className="text-text-secondary hover:text-danger focus-visible:ring-primary rounded-full p-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icon icon={X} size="sm" />
              </button>
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
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addSocialLink}>
          + Add link
        </Button>
      </div>

      <div className="border-border-light space-y-3 border-t pt-6">
        <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
          Media
        </p>
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
            <button
              type="button"
              onClick={() => removeMediaUrl(index)}
              aria-label={`Remove media URL ${index + 1}`}
              className="text-text-secondary hover:text-danger focus-visible:ring-primary rounded-full p-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Icon icon={X} size="sm" />
            </button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addMediaUrl}>
          + Add media link
        </Button>
      </div>
    </div>
  );
}
