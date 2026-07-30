import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Avatar } from "@/components/atoms/avatar";

const meta = {
  component: Avatar,
  tags: ["ai-generated"],
  args: {
    alt: "Arjun Sharma",
    initials: "AS",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Large: Story = { args: { size: "lg" } };
export const Square: Story = { args: { variant: "square" } };

export const OnlineStatus: Story = {
  args: { status: "online" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: /online/i })).toBeVisible();
  },
};
