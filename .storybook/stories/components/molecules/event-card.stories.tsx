import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { EventCard } from "@/components/molecules/event-card";

const meta = {
  component: EventCard,
  tags: ["ai-generated"],
  args: {
    colorSeed: "gcode-build-sprint-2026",
    tags: [{ label: "Online" }, { label: "Free", tone: "success" }],
    title: "GCODE Build Sprint · Summer 2026",
    date: "15 Jul 2026 · 10:00 AM – 6:00 PM IST",
  },
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    href: "/events/gcode-build-sprint-2026",
    headerLabel: "Hackathon",
    location: "Online · Link shared after registration",
    urgencyLabel: "52 spots left",
    attendees: [
      { alt: "Priya Sharma", initials: "PS" },
      { alt: "Rahul Verma", initials: "RV" },
      { alt: "Ananya Iyer", initials: "AI" },
    ],
    attendeesLabel: "+52 registered",
  },
};

export const Featured: Story = {
  args: {
    variant: "featured",
    href: "/events/maarg-music-jam-night",
    tags: [{ label: "Cultural Event" }, { label: "Free", tone: "success" }],
    title: "MAARG Music Jam Night",
    date: "15 Aug 2026 · 6:00 PM IST",
    location: "In-Person",
    eventType: "Cultural Event",
    attendeesLabel: "245 going",
  },
};

// Session/talk formats show session length instead of a headcount — the
// audience cares how long the webinar runs, not how many spots are left.
export const WebinarShowsDuration: Story = {
  args: {
    variant: "default",
    href: "/events/intro-to-oracle-ai",
    tags: [{ label: "Webinar" }, { label: "Free", tone: "success" }],
    title: "Intro to Oracle AI Vector Search",
    date: "3 Sep 2026 · 5:00 PM IST",
    location: "Online · Link shared after registration",
    eventType: "Webinar",
    durationText: "1h 30m",
    attendeesLabel: "180 going",
  },
};

// Competitive/limited-entry formats show remaining capacity instead —
// urgency to register matters more than session length here.
export const HackathonShowsSpotsLeft: Story = {
  args: {
    variant: "default",
    href: "/events/gcode-build-sprint-2026",
    tags: [{ label: "Hackathon" }, { label: "Free", tone: "success" }],
    title: "GCODE Build Sprint · Summer 2026",
    date: "15 Jul 2026 · 10:00 AM IST",
    eventType: "Hackathon",
    spotsLeft: 12,
    attendeesLabel: "88 going",
  },
};

export const RendersRealHref: Story = {
  args: { variant: "default", href: "/events/gcode-build-sprint-2026" },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", {
      name: /gcode build sprint · summer 2026/i,
    });
    await expect(link).toHaveAttribute(
      "href",
      "/events/gcode-build-sprint-2026",
    );
  },
};
