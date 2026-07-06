import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionLabel } from "./section-label";

const meta = {
  component: SectionLabel,
  tags: ["ai-generated"],
  args: {
    children: "Featured",
  },
} satisfies Meta<typeof SectionLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
