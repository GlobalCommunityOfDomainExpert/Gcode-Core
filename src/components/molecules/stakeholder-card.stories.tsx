import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { StakeholderCard } from "./stakeholder-card";

const meta = {
  component: StakeholderCard,
  tags: ["ai-generated"],
  args: {
    avatarInitials: "ID",
    name: "IIT Delhi Innovation Hub",
    category: "Venue Partner",
    org: "IIT Delhi",
    bio: "Campus auditoriums and labs available for hackathons and symposiums.",
    tags: ["Auditorium", "Up to 500 seats"],
    onAction: fn(),
  },
} satisfies Meta<typeof StakeholderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = { args: { selected: false } };

export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /selected/i }),
    ).toBeVisible();
  },
};

export const ActionFiresCallback: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /select/i }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};
