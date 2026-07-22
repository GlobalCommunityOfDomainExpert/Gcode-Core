import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Checkbox } from "@/components/atoms/checkbox";

const meta = {
  component: Checkbox,
  tags: ["ai-generated"],
  args: {
    id: "free-filter",
    label: "Free",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: /free/i })).toBeChecked();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const Indeterminate: Story = {
  args: { indeterminate: true },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", {
      name: /free/i,
    }) as HTMLInputElement;
    // indeterminate is a DOM property, not reflected as an HTML attribute —
    // proves the component's useEffect actually set it, not just accepted the prop.
    await expect(checkbox.indeterminate).toBe(true);
  },
};
