import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Chip } from "./chip";

const meta = {
  component: Chip,
  tags: ["ai-generated"],
  args: {
    children: "Free",
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {
  args: { selected: false },
  play: async ({ canvas }) => {
    const chip = canvas.getByRole("checkbox", { name: /free/i });
    await expect(chip).toHaveAttribute("aria-checked", "false");
  },
};

export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvas }) => {
    const chip = canvas.getByRole("checkbox", { name: /free/i });
    await expect(chip).toHaveAttribute("aria-checked", "true");
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const ClickFiresOnClick: Story = {
  args: { selected: false, onClick: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const chip = canvas.getByRole("checkbox", { name: /free/i });
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
