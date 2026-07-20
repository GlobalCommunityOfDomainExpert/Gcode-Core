import { Globe } from "lucide-react";
import { Badge } from "@/components/atoms";
import {
  ExternalLinkRow,
  ProfileHeader,
  ProfileSectionCard,
  QuoteBlock,
} from "@/components/molecules";

export function StartupProfileView() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        avatarInitials="LK"
        avatarShape="square"
        name="Loopkart"
        subtitle="Mumbai"
        badges={[
          { label: "Seed", variant: "solid", tone: "neutral" },
          { label: "Supply Chain Tech" },
        ]}
      />

      <ProfileSectionCard>
        <QuoteBlock>
          A B2B SaaS platform for sustainable packaging supply chains.
        </QuoteBlock>
      </ProfileSectionCard>

      <ProfileSectionCard title="Active Problems Posted">
        <div className="border-border-light flex flex-col gap-1 rounded-md border p-4">
          <Badge variant="muted" tone="neutral" size="sm" className="w-fit">
            Legal/CA
          </Badge>
          <h4 className="text-body text-text-primary font-semibold">
            Co-founder dispute regarding IP assignment in pre-seed startup
          </h4>
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard title="Company Info">
        <div className="text-body flex justify-between">
          <span className="text-text-secondary">Stage</span>
          <span className="text-text-primary font-semibold">Seed</span>
        </div>
        <div className="text-body flex justify-between">
          <span className="text-text-secondary">Funding</span>
          <span className="text-text-primary font-semibold">VC Backed</span>
        </div>
        <div className="text-body flex justify-between">
          <span className="text-text-secondary">Team Size</span>
          <span className="text-text-primary font-semibold">11-50</span>
        </div>
      </ProfileSectionCard>

      <ExternalLinkRow href="https://loopkart.com" label="Website" icon={Globe} />
    </div>
  );
}
