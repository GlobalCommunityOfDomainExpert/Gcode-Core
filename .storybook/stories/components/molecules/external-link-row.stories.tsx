import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Globe } from "lucide-react";
import { ExternalLinkRow } from "@/components/molecules/external-link-row";

const meta = {
  component: ExternalLinkRow,
  tags: ["ai-generated"],
  args: {
    href: "https://loopkart.com",
    label: "Website",
  },
} satisfies Meta<typeof ExternalLinkRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomIcon: Story = { args: { icon: Globe } };
