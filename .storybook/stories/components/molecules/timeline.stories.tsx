import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Timeline } from "@/components/molecules/timeline";

const meta = {
  component: Timeline,
  tags: ["ai-generated"],
  args: {
    items: [
      {
        title: "10:00 AM — Kickoff & Problem Statement",
        description: "Opening session, team registration, problem brief",
        past: true,
      },
      {
        title: "12:00 PM — Expert Office Hours",
        description: "30-min live Q&A with domain experts",
        active: true,
      },
      {
        title: "5:00 PM — Winners Announced",
        description: "Live judging + prize distribution",
      },
    ],
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
