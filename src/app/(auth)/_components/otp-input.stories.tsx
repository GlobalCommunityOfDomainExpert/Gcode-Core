import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { OtpInput } from "./otp-input";

const meta = {
  component: OtpInput,
  tags: ["ai-generated"],
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = { args: { error: true } };

export const Disabled: Story = { args: { disabled: true } };

export const AutoAdvanceAndComplete: Story = {
  args: { onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const boxes = canvas.getAllByRole("textbox");
    for (const [index, digit] of ["1", "2", "3", "4", "5", "6"].entries()) {
      await userEvent.type(boxes[index], digit);
    }
    await expect(args.onChange).toHaveBeenLastCalledWith("123456");
  },
};

export const PasteDistributesAcrossBoxes: Story = {
  args: { onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const boxes = canvas.getAllByRole("textbox");
    await userEvent.click(boxes[0]);
    await userEvent.paste("123456");
    await expect(args.onChange).toHaveBeenLastCalledWith("123456");
    for (const [index, digit] of ["1", "2", "3", "4", "5", "6"].entries()) {
      await expect(boxes[index]).toHaveValue(digit);
    }
  },
};

export const BackspaceMovesFocusBack: Story = {
  play: async ({ canvas, userEvent }) => {
    const boxes = canvas.getAllByRole("textbox");
    await userEvent.type(boxes[0], "1");
    await expect(boxes[1]).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    await expect(boxes[0]).toHaveFocus();
  },
};
