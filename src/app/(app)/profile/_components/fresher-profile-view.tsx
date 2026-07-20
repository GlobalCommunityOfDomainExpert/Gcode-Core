import { Badge } from "@/components/atoms";
import {
  ExternalLinkRow,
  ProfileHeader,
  ProfileSectionCard,
  Timeline,
  TimelineItem,
} from "@/components/molecules";

const TIMELINE: TimelineItem[] = [
  {
    title: "Frontend Developer Intern · FinWeb Solutions",
    time: "May 2025 – Aug 2025",
  },
  {
    title: "B.Tech Computer Science · Delhi Technological University",
    time: "2023 – 2027",
  },
];

export function FresherProfileView() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        avatarInitials="PS"
        name="Priya Singh"
        subtitle="Delhi NCR"
        badges={[
          { label: "JavaScript" },
          { label: "React" },
          { label: "Node.js" },
        ]}
      />

      <ProfileSectionCard>
        <p className="text-body text-text-secondary">
          Aspiring full-stack developer passionate about building scalable web
          applications.
        </p>
      </ProfileSectionCard>

      <ProfileSectionCard title="Experience & Education">
        <Timeline items={TIMELINE} />
      </ProfileSectionCard>

      <ProfileSectionCard title="Available For">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" tone="neutral" size="sm">
            Internship (Paid)
          </Badge>
          <Badge variant="outline" tone="neutral" size="sm">
            Freelance Project
          </Badge>
          <Badge variant="muted" tone="success" size="sm">
            10-20 hrs/week
          </Badge>
        </div>
      </ProfileSectionCard>

      <div className="flex flex-wrap gap-4">
        <ExternalLinkRow href="https://github.com/priyasingh" label="GitHub" />
        <ExternalLinkRow href="https://priyasingh.dev" label="Portfolio" />
      </div>
    </div>
  );
}
