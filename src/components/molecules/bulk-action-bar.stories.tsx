import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { BulkActionBar } from "./bulk-action-bar";

const meta = {
  component: BulkActionBar,
  tags: ["ai-generated"],
  args: {
    onClear: fn(),
    actions: [{ label: "Send Email", onClick: fn() }],
  },
} satisfies Meta<typeof BulkActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
  args: { selectedCount: 3 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3 selected")).toBeVisible();
  },
};

export const HiddenWhenNoneSelected: Story = {
  args: { selectedCount: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/selected/i)).not.toBeInTheDocument();
  },
};

export const ClearFiresOnClear: Story = {
  args: { selectedCount: 5 },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /clear/i }));
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};
