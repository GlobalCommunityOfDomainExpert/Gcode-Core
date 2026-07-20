import { Globe, Share2 } from "lucide-react";
import { Badge } from "@/components/atoms";
import {
  ExternalLinkRow,
  ProfileHeader,
  ProfileSectionCard,
} from "@/components/molecules";

export function InstitutionProfileView() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        avatarInitials="RCE"
        avatarShape="square"
        name="Ramanujan College of Engineering"
        subtitle="Chennai, Tamil Nadu"
        badges={[{ label: "University / College" }]}
      />

      <ProfileSectionCard title="About Institution">
        <p className="text-body text-text-secondary">
          A premier engineering institution focused on innovation and
          entrepreneurship.
        </p>
      </ProfileSectionCard>

      <ProfileSectionCard title="Departments">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" tone="neutral" size="sm">
            Computer Science
          </Badge>
          <Badge variant="outline" tone="neutral" size="sm">
            Mechanical
          </Badge>
          <Badge variant="outline" tone="neutral" size="sm">
            Electronics
          </Badge>
        </div>
      </ProfileSectionCard>

      <div className="flex flex-wrap gap-4">
        <ExternalLinkRow
          href="https://rce.edu.in"
          label="Official Website"
          icon={Globe}
        />
        <ExternalLinkRow
          href="https://linkedin.com/school/rce"
          label="Social"
          icon={Share2}
        />
      </div>
    </div>
  );
}
