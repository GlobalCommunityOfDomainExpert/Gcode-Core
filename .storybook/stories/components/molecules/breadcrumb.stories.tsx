import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Breadcrumb } from "@/components/molecules/breadcrumb";

const meta = {
  component: Breadcrumb,
  tags: ["ai-generated"],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Organizing", href: "/my-organized-events" },
      { label: "GCODE Build Sprint · Summer 2026" },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: /organizing/i }),
    ).toHaveAttribute("href", "/my-organized-events");
    await expect(
      canvas.getByText("GCODE Build Sprint · Summer 2026"),
    ).toHaveAttribute("aria-current", "page");
  },
};

export const SingleLevel: Story = {
  args: { items: [{ label: "Events" }] },
};
