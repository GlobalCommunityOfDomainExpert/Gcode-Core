import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ChecklistItem } from "./checklist-item";

const meta = {
  component: ChecklistItem,
  tags: ["ai-generated"],
  args: {
    label: "Add event description",
  },
} satisfies Meta<typeof ChecklistItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Incomplete: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: /add event description/i }),
    ).not.toBeChecked();
  },
};

export const Completed: Story = {
  args: { completed: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: /add event description/i }),
    ).toBeChecked();
  },
};

export const WithSubtext: Story = {
  args: { subtext: "At least 2 sentences recommended" },
};
