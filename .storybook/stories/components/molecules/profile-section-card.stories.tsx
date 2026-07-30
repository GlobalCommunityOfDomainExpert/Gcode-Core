import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileSectionCard } from "@/components/molecules/profile-section-card";

const meta = {
  component: ProfileSectionCard,
  tags: ["ai-generated"],
  args: {
    title: "About Me",
    children: <p>I specialize in early-stage startup law.</p>,
  },
} satisfies Meta<typeof ProfileSectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTitle: Story = {};

export const NoTitle: Story = { args: { title: undefined } };
