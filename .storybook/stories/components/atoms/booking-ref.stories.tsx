import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookingRef } from "@/components/atoms/booking-ref";

const meta = {
  component: BookingRef,
  tags: ["ai-generated"],
  args: {
    children: "GCODE-9F2A-7731",
  },
} satisfies Meta<typeof BookingRef>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
