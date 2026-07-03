"use client";

import { useState } from "react";
import {
  Award,
  Calendar,
  MessageSquare,
  Monitor,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button, Input, Select, Textarea } from "@/components/atoms";
import {
  Accordion,
  AvatarGroup,
  Banner,
  Breadcrumb,
  CertificationCard,
  ChecklistItem,
  CheckoutSummary,
  Chip,
  Dropdown,
  EmptyState,
  EventCard,
  ExpertCard,
  FormField,
  Modal,
  NotificationItem,
  Pagination,
  ProblemCard,
  RoleCTA,
  SearchBar,
  SelectableCard,
  StatCard,
  StepIndicator,
  Tabs,
  Timeline,
  ToggleGroup,
} from "@/components/molecules";

const topics = ["Tech", "Legal/CA", "Growth", "Design"];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border-light space-y-4 border-b pb-8">
      <h2 className="text-heading text-text-primary font-extrabold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function MoleculesShowcasePage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(3);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Tech"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [eventType, setEventType] = useState("hackathon");
  const [mode, setMode] = useState("online");

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-1">
        <p className="text-small text-text-secondary font-semibold tracking-wide uppercase">
          GCODE Design System
        </p>
        <h1 className="text-display text-text-primary font-extrabold">
          Molecule Showcase
        </h1>
      </header>

      <Section title="Breadcrumb">
        <Breadcrumb
          items={[
            { label: "Home", href: "#" },
            { label: "Dashboard", href: "#" },
            { label: "Profile" },
          ]}
        />
      </Section>

      <Section title="Search Bar">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search experts..."
          className="max-w-sm"
        />
      </Section>

      <Section title="Tabs">
        <Tabs
          items={[
            { value: "all", label: "All" },
            { value: "events", label: "Events" },
            { value: "webinars", label: "Webinars" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <p className="text-small text-text-secondary">
          Active tab: {activeTab}
        </p>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Chip
              key={topic}
              selected={selectedTopics.includes(topic)}
              onClick={() => toggleTopic(topic)}
            >
              {topic}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Dropdown">
        <Dropdown
          trigger={<Button variant="secondary">Actions ▾</Button>}
          items={[
            { label: "Edit", onSelect: () => {} },
            { label: "Duplicate", onSelect: () => {} },
            { divider: true, label: "divider" },
            { label: "Sign Out", onSelect: () => {} },
          ]}
        />
      </Section>

      <Section title="Pagination">
        <Pagination page={page} totalPages={10} onPageChange={setPage} />
      </Section>

      <Section title="Accordion">
        <Accordion
          items={[
            {
              title: "What is GCODE?",
              content: "A professional collaboration platform.",
            },
            {
              title: "How do I join an event?",
              content: "Register from the event page.",
            },
            {
              title: "Can I cancel a booking?",
              content: "Yes, up to 24 hours before start.",
            },
          ]}
          defaultOpen={0}
        />
      </Section>

      <Section title="Form Field">
        <div className="flex max-w-sm flex-col gap-4">
          <FormField
            label="Event Title"
            htmlFor="ff-title"
            required
            hint="Minimum 10 characters"
          >
            <Input id="ff-title" placeholder="e.g. GCODE Build Sprint" />
          </FormField>
          <FormField label="Description" htmlFor="ff-desc">
            <Textarea id="ff-desc" placeholder="Describe the event..." />
          </FormField>
          <FormField
            label="Duration"
            htmlFor="ff-duration"
            error="Please select a duration"
          >
            <Select id="ff-duration" error defaultValue="">
              <option value="" disabled>
                Choose duration
              </option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Empty State">
        <EmptyState
          icon={Calendar}
          title="No Upcoming Events"
          description="You haven't registered for any events yet."
          action={<Button variant="primary">Browse Events</Button>}
        />
      </Section>

      <Section title="Modal">
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Open Modal
        </Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm Registration"
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p>Are you sure you want to register for this event?</p>
        </Modal>
      </Section>

      <Section title="Avatar Group">
        <AvatarGroup
          items={[
            { alt: "Ada Lovelace", initials: "AL" },
            { alt: "Grace Hopper", initials: "GH" },
            { alt: "Katherine Johnson", initials: "KJ" },
          ]}
          max={3}
          overflowLabel="+148 registered"
        />
      </Section>

      <Section title="Banner">
        <div className="flex flex-col gap-2">
          <Banner tone="info">New feature: expert booking is now live.</Banner>
          <Banner tone="success">Registration confirmed!</Banner>
          <Banner tone="warning">Your session starts in 10 minutes.</Banner>
          <Banner tone="danger" onDismiss={() => {}}>
            Payment failed. Please retry.
          </Banner>
        </div>
      </Section>

      <Section title="Certification Card">
        <CertificationCard
          icon={Award}
          title="Domain Expert"
          description="Complete 3 webinars to earn"
          actionLabel="Earn"
          earned={false}
        />
      </Section>

      <Section title="Checklist Item">
        <div className="flex flex-col gap-2">
          <ChecklistItem label="Registration complete" completed />
          <ChecklistItem label="Save the date" subtext="Add to your calendar" />
        </div>
      </Section>

      <Section title="Checkout Summary">
        <div className="max-w-sm">
          <CheckoutSummary
            items={[
              { label: "Subtotal", value: "₹4,500" },
              { label: "Fees", value: "₹150" },
            ]}
            total="₹4,650"
            actionLabel="Register"
          />
        </div>
      </Section>

      <Section title="Event Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <EventCard
            variant="compact"
            colorSeed="building-secure-auth-systems"
            tags={[{ label: "Tech" }, { label: "Free", tone: "success" }]}
            title="Building secure auth systems"
            date="10 Jul 2026"
          />
          <EventCard
            variant="featured"
            colorSeed="gcode-sprint"
            imageSrc="https://picsum.photos/seed/gcode-sprint/640/360"
            headerLabel="Hackathon"
            tags={[{ label: "Online" }, { label: "Free", tone: "success" }]}
            title="GCODE Build Sprint · Summer 2026"
            date="15 Jul 2026 · 10:00 AM IST"
            location="Online"
            attendees={[
              { alt: "Ada Lovelace", initials: "AL" },
              { alt: "Grace Hopper", initials: "GH" },
            ]}
            attendeesLabel="+148 registered"
            urgencyLabel="52 spots left"
          />
        </div>
      </Section>

      <Section title="Expert Card">
        <div className="max-w-sm">
          <ExpertCard
            avatarInitials="JD"
            name="Jane Doe"
            title="Corporate Law & Finance"
            rating={4.9}
            ratingCount={42}
            bio="Saved a startup's co-founder agreement with a reverse-vesting clause."
            tags={["Legal", "Fundraising"]}
            availability="Available Today"
            rateRange="₹1,500/hr - 5,000/hr"
          />
        </div>
      </Section>

      <Section title="Notification Item">
        <div className="flex max-w-sm flex-col gap-1">
          <NotificationItem
            avatarInitials="SS"
            description="Shashwat commented on your post."
            timestamp="2m ago"
            unread
          />
          <NotificationItem
            avatarInitials="AL"
            description="Ada Lovelace booked your session."
            timestamp="1h ago"
          />
        </div>
      </Section>

      <Section title="Problem Card">
        <ProblemCard
          tags={[{ label: "Legal/CA" }, { label: "Urgent", tone: "warning" }]}
          matchedReason="Legal expertise"
          title="Need help with CA compliance for fundraising"
          snippet="We incorporated 2 months ago and angels are asking for our cap table and compliance certificates."
          actions={
            <>
              <Button variant="secondary">
                <MessageSquare className="size-4" /> Comment insight
              </Button>
              <Button variant="secondary">
                <Phone className="size-4" /> Request call
              </Button>
              <Button variant="ghost">→ Pass</Button>
            </>
          }
        />
      </Section>

      <Section title="Role CTA">
        <RoleCTA
          title="Ready to share skills?"
          description="Join as an expert and start mentoring founders."
          actionLabel="Join as Expert"
        />
      </Section>

      <Section title="Selectable Card">
        <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
          <SelectableCard
            icon={Monitor}
            title="Hackathon"
            subtitle="Build sprints"
            selected={eventType === "hackathon"}
            onSelect={() => setEventType("hackathon")}
          />
          <SelectableCard
            icon={Sparkles}
            title="Expert AMA"
            subtitle="Live Q&A"
            selected={eventType === "ama"}
            onSelect={() => setEventType("ama")}
          />
        </div>
      </Section>

      <Section title="Stat Card">
        <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
          <StatCard
            label="Total Registrations"
            value="148"
            sub="+12 this week"
          />
          <StatCard
            label="Total Earned"
            value="₹48,500"
            trend={{ value: "+12%" }}
          />
        </div>
      </Section>

      <Section title="Step Indicator">
        <StepIndicator
          steps={[
            { label: "Type", status: "completed" },
            { label: "Details", status: "current" },
            { label: "Review", status: "upcoming" },
          ]}
        />
      </Section>

      <Section title="Timeline">
        <Timeline
          items={[
            {
              title: "10:00 AM — Kickoff",
              description: "Opening session and brief.",
              active: true,
            },
            { title: "12:00 PM — Office Hours", description: "Q&A session." },
            {
              title: "2:00 PM — Wrap-up",
              description: "Closing remarks.",
              past: true,
            },
          ]}
        />
      </Section>

      <Section title="Toggle Group">
        <ToggleGroup
          options={[
            { value: "online", label: "Online" },
            { value: "in-person", label: "In-Person" },
            { value: "hybrid", label: "Hybrid" },
          ]}
          value={mode}
          onChange={setMode}
        />
      </Section>
    </main>
  );
}
