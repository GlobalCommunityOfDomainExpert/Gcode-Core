import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button, Input } from "@/components/atoms";
import { AuthCard } from "./auth-card";

const meta = {
  component: AuthCard,
  tags: ["ai-generated"],
  args: {
    title: "Welcome Back",
    subtitle: "Sign in to your GCODE account",
    children: (
      <div className="flex flex-col gap-4">
        <Input placeholder="you@example.com" />
        <Input type="password" placeholder="••••••••" />
        <Button variant="primary" className="w-full">
          Sign In
        </Button>
      </div>
    ),
  },
} satisfies Meta<typeof AuthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoSubtitle: Story = {
  args: { subtitle: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Welcome Back")).toBeVisible();
  },
};
