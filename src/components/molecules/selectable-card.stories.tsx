import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Hammer } from "lucide-react";
import { expect, fn } from "storybook/test";
import { SelectableCard } from "./selectable-card";

const meta = {
  component: SelectableCard,
  tags: ["ai-generated"],
  args: {
    icon: Hammer,
    title: "Hackathon",
    subtitle: "Build sprint, team-based",
    onSelect: fn(),
  },
} satisfies Meta<typeof SelectableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = { args: { selected: false } };
export const Selected: Story = { args: { selected: true } };

export const ClickFiresOnSelect: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /hackathon/i }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};
