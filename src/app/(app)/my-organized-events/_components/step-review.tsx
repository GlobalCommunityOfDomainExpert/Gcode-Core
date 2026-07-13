import { Card, SectionLabel } from "@/components/atoms";
import { EventDetailData } from "@/lib/zod/event";

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="text-body flex items-start justify-between gap-4 py-2">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary text-right font-medium">{value}</span>
    </div>
  );
}

export interface StepReviewProps {
  data: EventDetailData;
}

export function StepReview({ data }: StepReviewProps) {
  const price = data.priceAmount > 0 ? `₹${data.priceAmount}` : "Free";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Review &amp; publish
        </h2>
        <p className="text-body text-text-secondary">
          Double-check everything before it goes live.
        </p>
      </div>

      <Card className="divide-border-light space-y-1 divide-y">
        <ReviewRow
          label="Type"
          value={data.type !== null ? String(data.type) : ""}
        />
        <ReviewRow label="Title" value={data.title} />
        <ReviewRow label="Price" value={price} />
        <ReviewRow
          label="Capacity"
          value={data.capacity ? `${data.capacity} attendees` : "Unlimited"}
        />
        <ReviewRow
          label="Certificate"
          value={data.certificate ? "Yes" : "No"}
        />
        <ReviewRow label="Mode" value={String(data.mode)} />
        <ReviewRow label="Date" value={data.date} />
        <ReviewRow label="Time" value={data.time} />
        <ReviewRow label="City" value={data.city} />
        <ReviewRow label="Venue address" value={data.location} />
        <ReviewRow label="Participation link" value={data.participationLink} />
        <ReviewRow
          label="Registration closes"
          value={data.registrationCloses}
        />
        <ReviewRow label="Duration" value={data.duration} />
      </Card>

      {data.description && (
        <Card className="space-y-1">
          <SectionLabel>Description</SectionLabel>
          {data.description
            .split("\n")
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="text-body text-text-secondary">
                {paragraph}
              </p>
            ))}
        </Card>
      )}

      {(data.coverImageUrl || data.mediaUrls.length > 0) && (
        <Card className="space-y-1">
          <ReviewRow
            label="Cover Image"
            value={data.coverImageUrl ? "Set" : "Not set"}
          />
          <ReviewRow label="Media" value={`${data.mediaUrls.length} link(s)`} />
        </Card>
      )}

      {data.timeline.length > 0 && (
        <Card className="space-y-2">
          <SectionLabel>Timeline ({data.timeline.length})</SectionLabel>
          <ul className="space-y-1">
            {data.timeline.map((item, index) => (
              <li key={index} className="text-body text-text-secondary">
                {item.time && `${item.time} — `}
                {item.title || "Untitled item"}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.socialLinks.length > 0 && (
        <Card className="space-y-2">
          <SectionLabel>Social links ({data.socialLinks.length})</SectionLabel>
          <ul className="space-y-1">
            {data.socialLinks.map((link, index) => (
              <li key={index} className="text-body text-text-secondary">
                {link.platform || "Link"}: {link.url}
              </li>
            ))}
          </ul>
        </Card>
      )}

    </div>
  );
}
