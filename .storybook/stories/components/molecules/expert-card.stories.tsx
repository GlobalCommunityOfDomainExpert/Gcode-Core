import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ExpertCard } from "@/components/molecules/expert-card";

const meta = {
  component: ExpertCard,
  tags: ["ai-generated"],
  args: {
    avatarInitials: "AR",
    name: "Dr. Ananya Rao",
    title: "AI/ML Research Lead, Google DeepMind",
    rating: 4.8,
    ratingCount: 42,
    bio: "Speaks on applied ML and responsible AI for builder audiences.",
    tags: ["AI/ML", "Keynote"],
    availability: "Available weekdays",
    rateRange: "₹15,000 – ₹30,000",
    onAction: fn(),
  },
} satisfies Meta<typeof ExpertCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("4.8")).toBeVisible();
  },
};

export const CustomActionLabel: Story = {
  args: { actionLabel: "Request Introduction" },
};

export const ActionFiresCallback: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /book engagement/i }),
    );
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};
