import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NotificationItem } from "@/components/molecules/notification-item";

const meta = {
  component: NotificationItem,
  tags: ["ai-generated"],
  args: {
    avatarInitials: "GC",
    description: "Your event GCODE Build Sprint · Summer 2026 is now live.",
    timestamp: "2 hours ago",
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Read: Story = { args: { unread: false } };
export const Unread: Story = { args: { unread: true } };
