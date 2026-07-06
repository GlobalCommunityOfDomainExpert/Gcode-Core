import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ToggleGroup } from "./toggle-group";

const options = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Upcoming" },
];

const meta = {
  component: ToggleGroup,
  tags: ["ai-generated"],
  args: {
    options,
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: "week" },
};

export const ClickChangesActiveOption: Story = {
  args: { defaultValue: "week" },
  play: async ({ canvas, userEvent }) => {
    const weekOption = canvas.getByRole("radio", { name: "This Week" });
    const monthOption = canvas.getByRole("radio", { name: "This Month" });
    await expect(weekOption).toHaveAttribute("aria-checked", "true");

    await userEvent.click(monthOption);

    await expect(monthOption).toHaveAttribute("aria-checked", "true");
    await expect(weekOption).toHaveAttribute("aria-checked", "false");
  },
};
