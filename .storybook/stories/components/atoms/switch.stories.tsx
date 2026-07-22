import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Switch } from "@/components/atoms/switch";

const meta = {
  component: Switch,
  tags: ["ai-generated"],
  args: {
    id: "certificate",
    label: "Issue a certificate on completion",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: { defaultChecked: false },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("switch", {
      name: /issue a certificate/i,
    });
    await expect(input).not.toBeChecked();
  },
};

export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("switch", {
      name: /issue a certificate/i,
    });
    await expect(input).toBeChecked();
  },
};

export const Disabled: Story = { args: { disabled: true } };
