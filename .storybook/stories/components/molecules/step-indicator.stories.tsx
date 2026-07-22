import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StepIndicator } from "@/components/molecules/step-indicator";

const meta = {
  component: StepIndicator,
  tags: ["ai-generated"],
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    steps: [
      { label: "Type", status: "completed" },
      { label: "Details", status: "completed" },
      { label: "Schedule & Mode", status: "current" },
      { label: "Agenda & Media", status: "upcoming" },
      { label: "Review", status: "upcoming" },
    ],
  },
};

export const AllUpcoming: Story = {
  args: {
    steps: [
      { label: "Type", status: "current" },
      { label: "Details", status: "upcoming" },
      { label: "Review", status: "upcoming" },
    ],
  },
};

export const AllCompleted: Story = {
  args: {
    steps: [
      { label: "Type", status: "completed" },
      { label: "Details", status: "completed" },
      { label: "Review", status: "completed" },
    ],
  },
};
