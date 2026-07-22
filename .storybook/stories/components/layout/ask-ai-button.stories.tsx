import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { AskAiButton } from "@/components/layout/ask-ai-button";

const meta = {
  component: AskAiButton,
  tags: ["ai-generated"],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof AskAiButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /ask gcode ai/i }),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
