import { Badge } from "@/components/atoms";
import { getStakeholderById } from "@/lib/community-requests";
import { SelectedStakeholder, WizardData } from "./types";

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
  data: WizardData;
  selectedStakeholders: SelectedStakeholder[];
  showCommunityRequests?: boolean;
}

export function StepReview({
  data,
  selectedStakeholders,
  showCommunityRequests = true,
}: StepReviewProps) {
  const price = data.price === "Free" ? "Free" : `₹${data.priceAmount || "0"}`;

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

      <div className="divide-border-light border-border-light space-y-1 divide-y rounded-md border p-4">
        <ReviewRow label="Type" value={data.type ?? ""} />
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
        <ReviewRow label="Mode" value={data.mode} />
        <ReviewRow label="Date" value={data.date} />
        <ReviewRow label="Time" value={data.time} />
        <ReviewRow label="Location" value={data.location} />
        <ReviewRow
          label="Registration closes"
          value={data.registrationCloses}
        />
        <ReviewRow label="Duration" value={data.duration} />
      </div>

      {data.description && (
        <div className="border-border-light space-y-1 rounded-md border p-4">
          <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
            Description
          </p>
          {data.description
            .split("\n")
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="text-body text-text-secondary">
                {paragraph}
              </p>
            ))}
        </div>
      )}

      {(data.coverImageUrl || data.mediaUrls.length > 0) && (
        <div className="border-border-light space-y-1 rounded-md border p-4">
          <ReviewRow
            label="Cover Image"
            value={data.coverImageUrl ? "Set" : "Not set"}
          />
          <ReviewRow label="Media" value={`${data.mediaUrls.length} link(s)`} />
        </div>
      )}

      {data.agenda.length > 0 && (
        <div className="border-border-light space-y-2 rounded-md border p-4">
          <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
            Agenda ({data.agenda.length})
          </p>
          <ul className="space-y-1">
            {data.agenda.map((item, index) => (
              <li key={index} className="text-body text-text-secondary">
                {item.time && `${item.time} — `}
                {item.title || "Untitled item"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.socialLinks.length > 0 && (
        <div className="border-border-light space-y-2 rounded-md border p-4">
          <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
            Social links ({data.socialLinks.length})
          </p>
          <ul className="space-y-1">
            {data.socialLinks.map((link, index) => (
              <li key={index} className="text-body text-text-secondary">
                {link.platform || "Link"}: {link.url}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCommunityRequests && (
        <div className="border-border-light space-y-2 rounded-md border p-4">
          <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
            Community requests ({selectedStakeholders.length})
          </p>
          {selectedStakeholders.length === 0 ? (
            <p className="text-body text-text-secondary">
              No stakeholders requested — you can skip this and add none.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedStakeholders.map((item) => {
                const stakeholder = getStakeholderById(item.stakeholderId);
                if (!stakeholder) return null;
                return (
                  <li
                    key={item.stakeholderId}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-body text-text-primary">
                      {stakeholder.name}
                    </span>
                    <Badge variant="muted" tone="primary" size="sm">
                      {item.category}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
