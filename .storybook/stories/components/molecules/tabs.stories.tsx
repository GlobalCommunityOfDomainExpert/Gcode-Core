import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Tabs } from "@/components/molecules/tabs";

const items = [
  { value: "all", label: "All" },
  { value: "webinars", label: "Webinars" },
  { value: "hackathons", label: "Hackathons" },
];

const meta = {
  component: Tabs,
  tags: ["ai-generated"],
  args: {
    items,
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: "all" },
};

export const ClickChangesActiveTab: Story = {
  args: { defaultValue: "all" },
  play: async ({ canvas, userEvent }) => {
    const allTab = canvas.getByRole("tab", { name: "All" });
    const webinarsTab = canvas.getByRole("tab", { name: "Webinars" });
    await expect(allTab).toHaveAttribute("aria-selected", "true");
    await expect(webinarsTab).toHaveAttribute("aria-selected", "false");

    await userEvent.click(webinarsTab);

    await expect(webinarsTab).toHaveAttribute("aria-selected", "true");
    await expect(allTab).toHaveAttribute("aria-selected", "false");
  },
};
