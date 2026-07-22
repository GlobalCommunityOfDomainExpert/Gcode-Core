import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Accordion } from "@/components/molecules/accordion";

const items = [
  {
    title: "What happens if I miss the registration deadline?",
    content: "You can still join the waitlist from the event page.",
  },
  {
    title: "Is a certificate provided?",
    content: "Yes, for participants who complete the full event.",
  },
];

const meta = {
  component: Accordion,
  tags: ["ai-generated"],
  args: {
    items,
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  play: async ({ canvas }) => {
    const first = canvas.getByRole("button", {
      name: /miss the registration deadline/i,
    });
    await expect(first).toHaveAttribute("aria-expanded", "false");
  },
};

export const DefaultOpen: Story = {
  args: { defaultOpen: 0 },
  play: async ({ canvas }) => {
    const first = canvas.getByRole("button", {
      name: /miss the registration deadline/i,
    });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText(/join the waitlist/i)).toBeVisible();
  },
};

export const ClickExpands: Story = {
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole("button", {
      name: /miss the registration deadline/i,
    });
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(first);
    await expect(first).toHaveAttribute("aria-expanded", "true");
  },
};
