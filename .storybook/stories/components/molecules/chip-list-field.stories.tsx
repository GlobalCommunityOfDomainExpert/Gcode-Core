import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ChipListField } from "@/components/molecules/chip-list-field";

const meta = {
  component: ChipListField,
  tags: ["ai-generated"],
  args: {
    label: "Primary Domains",
    htmlFor: "expert-domains",
    options: ["Legal/CA", "Corporate Law", "Frontend", "Backend"],
    selectedOptions: ["Legal/CA", "Corporate Law"],
  },
} satisfies Meta<typeof ChipListField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "Legal/CA" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      canvas.getByRole("checkbox", { name: "Frontend" }),
    ).toHaveAttribute("aria-checked", "false");
  },
};

export const NoneSelected: Story = {
  args: { selectedOptions: [] },
};
