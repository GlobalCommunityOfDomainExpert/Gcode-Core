import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Select } from "./select";

const meta = {
  component: Select,
  tags: ["ai-generated"],
  args: {
    "aria-label": "Event mode",
    children: (
      <>
        <option value="online">Online</option>
        <option value="in-person">In-Person</option>
        <option value="hybrid">Hybrid</option>
      </>
    ),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const WithError: Story = { args: { error: true } };
export const Disabled: Story = { args: { disabled: true } };

export const SelectingChangesValue: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", {
      name: /event mode/i,
    }) as HTMLSelectElement;
    await userEvent.selectOptions(select, "hybrid");
    await expect(select).toHaveValue("hybrid");
  },
};
