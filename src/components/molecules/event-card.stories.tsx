import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { EventCard } from "./event-card";

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

export const Compact: Story = {
  args: { variant: "compact", href: "/events/gcode-build-sprint-2026" },
};

export const Featured: Story = {
  args: {
    variant: "featured",
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

export const RendersRealHref: Story = {
  args: { variant: "compact", href: "/events/gcode-build-sprint-2026" },
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
