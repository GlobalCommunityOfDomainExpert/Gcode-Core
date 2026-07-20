import { Image as ImageIcon } from "lucide-react";
import { Button, Icon, SectionLabel } from "@/components/atoms";

export interface MediaUploadFieldsProps {
  bannerLabel: string;
  bannerPlaceholder: string;
  bannerHint: string;
  photoLabel: string;
  photoInitials: string;
  photoHint: string;
  photoShape?: "circle" | "square";
  photoButtonLabel?: string;
}

export function MediaUploadFields({
  bannerLabel,
  bannerPlaceholder,
  bannerHint,
  photoLabel,
  photoInitials,
  photoHint,
  photoShape = "circle",
  photoButtonLabel = "Upload Photo",
}: MediaUploadFieldsProps) {
  return (
    <>
      <div>
        <SectionLabel className="mb-2">{bannerLabel}</SectionLabel>
        <div className="border-border-light text-text-secondary flex h-32 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed">
          <Icon icon={ImageIcon} size="md" />
          <span className="text-small font-medium">{bannerPlaceholder}</span>
          <span className="text-small">{bannerHint}</span>
        </div>
      </div>

      <div>
        <SectionLabel className="mb-2">{photoLabel}</SectionLabel>
        <div className="flex items-center gap-4">
          <div
            className={`bg-bg-light text-text-secondary flex size-20 shrink-0 items-center justify-center text-lg font-bold ${
              photoShape === "circle" ? "rounded-full" : "rounded-md"
            }`}
          >
            {photoInitials}
          </div>
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit"
            >
              {photoButtonLabel}
            </Button>
            <span className="text-small text-text-secondary">{photoHint}</span>
          </div>
        </div>
      </div>
    </>
  );
}
