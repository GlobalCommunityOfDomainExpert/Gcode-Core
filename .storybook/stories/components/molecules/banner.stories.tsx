import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Banner } from "@/components/molecules/banner";

const meta = {
  component: Banner,
  tags: ["ai-generated"],
  args: {
    children: "This event has been cancelled by the organizer.",
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { tone: "info" } };
export const Success: Story = { args: { tone: "success" } };
export const Warning: Story = { args: { tone: "warning" } };
export const Danger: Story = { args: { tone: "danger" } };

export const DismissibleFiresCallback: Story = {
  args: { tone: "warning", onDismiss: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /dismiss/i }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};
