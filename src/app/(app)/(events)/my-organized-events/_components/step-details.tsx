import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button, Icon, Input, Textarea } from "@/components/atoms";
import { Chip, FormField } from "@/components/molecules";
import { UpdateEventDetailData, EventDetailData } from "@/lib/zod/event";
import { useLookup } from "@/hooks/use-lookup";
import { getCategories } from "@/lib/api/lookups";

export interface StepDetailsProps {
  data: EventDetailData;
  onChange: UpdateEventDetailData;
}

export function StepDetails({ data, onChange }: StepDetailsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useLookup(getCategories);

  function toggleCategory(id: number) {
    const next = data.categoryIds.includes(id)
      ? data.categoryIds.filter((c) => c !== id)
      : [...data.categoryIds, id];
    onChange("categoryIds", next);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (data.coverImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(data.coverImageUrl);
    }
    onChange("coverImageUrl", URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    if (data.coverImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(data.coverImageUrl);
    }
    onChange("coverImageUrl", "");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Tell us about the event
        </h2>
        <p className="text-body text-text-secondary">
          This shows up on the event&apos;s public page.
        </p>
      </div>

      <FormField label="Event Title" htmlFor="event-title" required>
        <Input
          id="event-title"
          value={data.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="e.g. GCODE Build Sprint · Winter 2026"
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="event-description"
        required
        hint="One idea per line — each becomes a paragraph on the event page."
      >
        <Textarea
          id="event-description"
          value={data.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Describe the event, who it's for, and what attendees will get out of it..."
          rows={4}
        />
      </FormField>

      <FormField
        label="Cover Image"
        htmlFor="event-cover-image"
        hint="Recommended size: 1600×600px (3:1 ratio). Images are cropped to fit the banner and card thumbnail. Leave blank to use an auto-generated color instead."
      >
        <input
          ref={fileInputRef}
          id="event-cover-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {data.coverImageUrl ? (
          <div className="relative aspect-3/1 w-full max-w-sm overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.coverImageUrl}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="Remove cover image"
              className="bg-primary/70 absolute top-2 right-2 rounded-full p-1 text-white hover:bg-black/70"
            >
              <Icon icon={X} size="sm" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon icon={Upload} size="sm" /> Upload Cover Image
          </Button>
        )}
      </FormField>

      <FormField
        label="Category Tags"
        htmlFor="event-categories"
        hint="Shown as tags on the event's public page."
      >
        <div id="event-categories" className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={data.categoryIds.includes(category.id)}
              onClick={() => toggleCategory(category.id)}
            >
              {category.category_name}
            </Chip>
          ))}
        </div>
      </FormField>
    </div>
  );
}
