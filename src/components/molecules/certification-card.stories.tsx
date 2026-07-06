import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Award } from "lucide-react";
import { expect, fn } from "storybook/test";
import { CertificationCard } from "./certification-card";

const meta = {
  component: CertificationCard,
  tags: ["ai-generated"],
  args: {
    icon: Award,
    title: "GCODE Build Sprint · Summer 2026",
    description: "Completed 15 Jul 2026",
    actionLabel: "Download",
    onAction: fn(),
  },
} satisfies Meta<typeof CertificationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotEarned: Story = { args: { earned: false } };
export const Earned: Story = { args: { earned: true } };

export const ActionFiresCallback: Story = {
  args: { earned: true },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /download/i }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};
