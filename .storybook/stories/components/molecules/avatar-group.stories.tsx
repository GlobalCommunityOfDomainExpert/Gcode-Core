import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AvatarGroup } from "@/components/molecules/avatar-group";

const items = [
  { alt: "Priya Sharma", initials: "PS" },
  { alt: "Rahul Verma", initials: "RV" },
  { alt: "Ananya Iyer", initials: "AI" },
  { alt: "Vikram Nair", initials: "VN" },
  { alt: "Sneha Kapoor", initials: "SK" },
];

const meta = {
  component: AvatarGroup,
  tags: ["ai-generated"],
  args: {
    items,
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OverflowCount: Story = {
  args: { max: 3 },
  play: async ({ canvas }) => {
    // 5 items, max 3 -> "+2" overflow indicator.
    await expect(canvas.getByText("+2")).toBeVisible();
  },
};

export const CustomOverflowLabel: Story = {
  args: { max: 3, overflowLabel: "+2 more" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("+2 more")).toBeVisible();
  },
};
