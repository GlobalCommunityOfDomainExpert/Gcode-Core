import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileHeader } from "./profile-header";

const meta = {
  component: ProfileHeader,
  tags: ["ai-generated"],
  args: {
    avatarInitials: "AS",
    name: "Arjun Sharma",
    subtitle: "Senior Corporate Counsel · Bengaluru",
    badges: [{ label: "Legal/CA" }, { label: "Corporate Law" }],
  },
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Circle: Story = {};

export const Square: Story = {
  args: {
    avatarShape: "square",
    avatarInitials: "LK",
    name: "Loopkart",
    subtitle: "Mumbai",
    badges: [
      { label: "Seed", variant: "solid", tone: "neutral" },
      { label: "Supply Chain Tech" },
    ],
  },
};

export const NoBadges: Story = { args: { badges: [] } };
