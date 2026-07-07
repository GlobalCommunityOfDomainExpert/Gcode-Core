import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = {
  component: Badge,
  tags: ["ai-generated"],
  args: {
    children: "Hackathon",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = { args: { variant: "solid", tone: "primary" } };
export const Outline: Story = {
  args: { variant: "outline", tone: "success" },
};
export const Muted: Story = { args: { variant: "muted", tone: "warning" } };
export const Danger: Story = { args: { variant: "solid", tone: "danger" } };
