import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AppShell } from "@/components/layout/app-shell";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

const meta = {
  component: AppShell,
  tags: ["ai-generated"],
  args: {
    navbar: <Navbar />,
    sidebar: (
      <Sidebar
        user={{ name: "Arjun Sharma", role: "Expert", avatarInitials: "AS" }}
      />
    ),
    children: <p>Page content</p>,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Page content")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /ask gcode ai/i }),
    ).toBeVisible();
  },
};
