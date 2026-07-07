import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./skeleton";

const meta = {
  component: Skeleton,
  tags: ["ai-generated"],
  args: {
    className: "h-4 w-40",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pulse: Story = { args: { variant: "pulse" } };
export const Base: Story = { args: { variant: "base" } };
