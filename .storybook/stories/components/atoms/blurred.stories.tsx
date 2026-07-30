import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Blurred } from "@/components/atoms/blurred";

const meta = {
  component: Blurred,
  tags: ["ai-generated"],
  args: {
    children: "priya.sharma@example.com",
  },
} satisfies Meta<typeof Blurred>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAccessibleLabel: Story = {
  args: { label: "Attendee email, hidden for privacy" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(/attendee email, hidden for privacy/i),
    ).toBeInTheDocument();
  },
};
