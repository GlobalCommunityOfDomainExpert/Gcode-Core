import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Navbar } from "@/components/layout/navbar";

const meta = {
  component: Navbar,
  tags: ["ai-generated"],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithUnreadNotifications: Story = {
  args: { hasUnreadNotifications: true },
};

export const MobileMenuOpens: Story = {
  play: async ({ canvas, userEvent }) => {
    // The mobile trigger is `md:hidden` — the test browser renders at a
    // desktop width, so query with `hidden: true` to bypass the visibility
    // filter. This verifies the open/close toggle logic, not the breakpoint.
    const menuButton = canvas.getByRole("button", {
      name: /open menu/i,
      hidden: true,
    });
    await userEvent.click(menuButton);
    await expect(
      canvas.getByRole("button", { name: /close menu/i, hidden: true }),
    ).toBeInTheDocument();
  },
};
