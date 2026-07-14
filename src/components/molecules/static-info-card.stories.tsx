import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaticInfoCard } from "./static-info-card";

const meta = {
  component: StaticInfoCard,
  tags: ["ai-generated"],
  args: {
    title: "Senior Corporate Counsel · Unicorn Tech",
    subtitle: "Jan 2024 – Present",
  },
} satisfies Meta<typeof StaticInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
