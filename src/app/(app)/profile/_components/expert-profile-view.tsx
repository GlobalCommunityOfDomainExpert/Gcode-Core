import { Calendar, FileText } from "lucide-react";
import { Icon } from "@/components/atoms";
import { ProfileHeader, ProfileSectionCard, QuoteBlock, Timeline, TimelineItem } from "@/components/molecules";

const TIMELINE: TimelineItem[] = [
  {
    title: "Senior Corporate Counsel · Unicorn Tech",
    time: "Jan 2024 – Present",
  },
  { title: "Legal Associate · AZB & Partners", time: "Jun 2020 – Dec 2023" },
  {
    title: "B.A. LL.B. (Hons.) · National Law School of India University",
    time: "2015 – 2020",
  },
];

export function ExpertProfileView() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        avatarInitials="AS"
        name="Arjun Sharma"
        subtitle="Senior Corporate Counsel · Bengaluru"
        badges={[{ label: "Legal/CA" }, { label: "Corporate Law" }]}
      />

      <ProfileSectionCard>
        <QuoteBlock>
          Restructured a seed-stage SaaS startup&apos;s founder agreement with
          a reverse-vesting clause — preventing a co-founder split before
          their Series A term sheet.
        </QuoteBlock>
      </ProfileSectionCard>

      <ProfileSectionCard title="About Me">
        <p className="text-body text-text-secondary">
          I specialize in early-stage startup law, founder agreements, term
          sheet negotiations, and IP assignment.
        </p>
      </ProfileSectionCard>

      <ProfileSectionCard title="Experience & Education">
        <Timeline items={TIMELINE} />
      </ProfileSectionCard>

      <ProfileSectionCard title="Services">
        <p className="text-body text-text-secondary flex items-center gap-2">
          <Icon icon={Calendar} size="sm" />
          1:1 Consultation · 30 mins · ₹2,000
        </p>
        <p className="text-body text-text-secondary flex items-center gap-2">
          <Icon icon={FileText} size="sm" />
          Document Review · ₹8,500 · 2d turnaround
        </p>
      </ProfileSectionCard>
    </div>
  );
}
