import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Input } from "@/components/atoms";
import { FormField } from "./form-field";

const meta = {
  component: FormField,
  tags: ["ai-generated"],
  args: {
    label: "Event Title",
    htmlFor: "event-title",
    children: <Input id="event-title" placeholder="e.g. GCODE Build Sprint" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "This shows up on the event's public page." },
};

export const WithError: Story = {
  args: { error: "Title is required." },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Title is required.")).toBeVisible();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("*")).toBeVisible();
  },
};
