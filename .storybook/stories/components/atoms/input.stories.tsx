import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Input } from "@/components/atoms/input";

const meta = {
  component: Input,
  tags: ["ai-generated"],
  args: {
    placeholder: "Enter event title…",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: true },
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText(/enter event title/i);
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const TypingUpdatesValue: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText(/enter event title/i);
    await userEvent.type(input, "GCODE Build Sprint");
    await expect(input).toHaveValue("GCODE Build Sprint");
  },
};
