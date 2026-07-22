import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatCard } from "@/components/molecules/stat-card";

const meta = {
  component: StatCard,
  tags: ["ai-generated"],
  args: {
    label: "Registered",
    value: "148",
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSub: Story = { args: { sub: "of 200 capacity" } };
export const PositiveTrend: Story = {
  args: { trend: { value: "+12%", tone: "success" } },
};
export const NegativeTrend: Story = {
  args: { trend: { value: "-4%", tone: "danger" } },
};
