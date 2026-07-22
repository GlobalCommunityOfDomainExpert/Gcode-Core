import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { GoogleButton } from "@/app/(auth)/_components/google-button";

const meta = {
  component: GoogleButton,
  tags: ["ai-generated"],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof GoogleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsButton: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /continue with google/i }),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const AsLink: Story = {
  args: { href: "/sign-up?step=stakeholder", onClick: undefined },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: /continue with google/i }),
    ).toHaveAttribute("href", "/sign-up?step=stakeholder");
  },
};
