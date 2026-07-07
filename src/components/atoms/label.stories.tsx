import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Label } from "./label";

const meta = {
  component: Label,
  tags: ["ai-generated"],
  args: {
    children: "Event Title",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("*")).toBeVisible();
  },
};

export const ErrorState: Story = { args: { error: true } };
export const DisabledState: Story = { args: { disabled: true } };
