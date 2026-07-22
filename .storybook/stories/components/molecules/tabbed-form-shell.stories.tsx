import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { TabbedFormShell } from "@/components/molecules/tabbed-form-shell";

const tabs = [
  { value: "basics", label: "Basic Information" },
  { value: "bio", label: "Bio & Experience" },
];

const meta = {
  component: TabbedFormShell,
  tags: ["ai-generated"],
  args: {
    tabs,
    activeTab: "basics",
    onTabChange: fn(),
    children: <p>Basic Information content</p>,
  },
} satisfies Meta<typeof TabbedFormShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondTabActive: Story = {
  args: { activeTab: "bio", children: <p>Bio & Experience content</p> },
};

export const ClickTabFiresOnTabChange: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole("tab", { name: "Bio & Experience" }),
    );
    await expect(args.onTabChange).toHaveBeenCalledWith("bio");
  },
};
