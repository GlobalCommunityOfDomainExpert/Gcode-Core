import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Textarea } from "@/components/atoms/textarea";

const meta = {
  component: Textarea,
  tags: ["ai-generated"],
  args: {
    placeholder: "Describe the event…",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Filled: Story = { args: { variant: "filled" } };
export const Outline: Story = { args: { variant: "outline" } };

export const WithError: Story = {
  args: { error: true },
  play: async ({ canvas }) => {
    const textarea = canvas.getByPlaceholderText(/describe the event/i);
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
  },
};
