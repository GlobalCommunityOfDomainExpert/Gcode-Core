import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Link } from "@/components/atoms/link";

const meta = {
  component: Link,
  tags: ["ai-generated"],
  args: {
    href: "#",
    children: "View Terms & Conditions",
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Small: Story = { args: { size: "sm" } };
