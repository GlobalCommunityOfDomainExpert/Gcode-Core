import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarX } from "lucide-react";
import { ButtonLink } from "@/components/atoms";
import { EmptyState } from "./empty-state";

const meta = {
  component: EmptyState,
  tags: ["ai-generated"],
  args: {
    icon: CalendarX,
    title: "Nothing in this range",
    description:
      "Try a wider date range, or browse events to register for more.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <ButtonLink href="/events" variant="primary">
        Browse Events
      </ButtonLink>
    ),
  },
};

export const NoIcon: Story = { args: { icon: undefined } };
