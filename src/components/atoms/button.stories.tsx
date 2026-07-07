import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "./button";

const meta = {
  component: Button,
  tags: ["ai-generated"],
  args: {
    children: "Publish Event",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = { args: { variant: "secondary" } };
export const Danger: Story = { args: { variant: "danger" } };

export const Loading: Story = {
  args: { variant: "primary", loading: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /publish event/i });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toBeDisabled();
  },
};

// CssCheck — Button's primary variant uses bg-primary (--g-color-primary:
// hsl(206, 42%, 18%) -> rgb(27, 48, 65)); fails if Tailwind/global CSS
// did not load into the preview.
export const CssCheck: Story = {
  args: { variant: "primary" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /publish event/i });
    await expect(getComputedStyle(button).backgroundColor).toBe(
      "rgb(27, 48, 65)",
    );
  },
};
