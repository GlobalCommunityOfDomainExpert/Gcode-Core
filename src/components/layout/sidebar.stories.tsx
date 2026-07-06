import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Sidebar } from "./sidebar";

const meta = {
  component: Sidebar,
  tags: ["ai-generated"],
  args: {
    user: {
      name: "Arjun Sharma",
      role: "Expert",
      avatarInitials: "AS",
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Panel: Story = { args: { variant: "panel" } };

export const WithProfileCompletion: Story = {
  args: { variant: "bare", profileCompletion: 60 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/60% complete/i)).toBeVisible();
  },
};

export const ProfileMenuOpens: Story = {
  args: { variant: "bare" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /arjun sharma/i }),
    );
    await expect(
      canvas.getByRole("menuitem", { name: /view profile/i }),
    ).toBeVisible();
  },
};
