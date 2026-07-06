import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calendar } from "lucide-react";
import { expect } from "storybook/test";
import { Icon } from "./icon";

const meta = {
  component: Icon,
  tags: ["ai-generated"],
  args: {
    icon: Calendar,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = {
  play: async ({ canvasElement }) => {
    // No label -> purely decorative, must be hidden from the accessibility tree.
    const svg = canvasElement.querySelector("svg");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
  },
};

export const WithAccessibleLabel: Story = {
  args: { label: "Event date" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: /event date/i }),
    ).toBeVisible();
  },
};

export const Large: Story = { args: { size: "lg", label: "Event date" } };
