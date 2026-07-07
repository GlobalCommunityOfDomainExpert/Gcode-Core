import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { RoleCTA } from "./role-cta";

const meta = {
  component: RoleCTA,
  tags: ["ai-generated"],
  args: {
    title: "Ready to host your own event?",
    description: "Set up a hackathon, webinar, or meetup in a few steps.",
    actionLabel: "Host Event",
    onAction: fn(),
  },
} satisfies Meta<typeof RoleCTA>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoDescription: Story = { args: { description: undefined } };

export const ActionFiresCallback: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /host event/i }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};
