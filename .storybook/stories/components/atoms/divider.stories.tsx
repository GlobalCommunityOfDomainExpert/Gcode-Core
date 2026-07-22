import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Divider } from "@/components/atoms/divider";

const meta = {
  component: Divider,
  tags: ["ai-generated"],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).not.toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div style={{ height: 40 }}>
      <Divider {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  },
};

export const Thick: Story = { args: { thickness: "thick" } };
