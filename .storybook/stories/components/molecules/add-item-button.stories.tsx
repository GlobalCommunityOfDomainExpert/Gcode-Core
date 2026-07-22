import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AddItemButton } from "@/components/molecules/add-item-button";

const meta = {
  component: AddItemButton,
  tags: ["ai-generated"],
  args: { label: "Add Another Position" },
} satisfies Meta<typeof AddItemButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "+ Add Another Position" }),
    ).toBeVisible();
  },
};
