import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ButtonLink } from "@/components/atoms/button-link";
import { TicketFrame } from "@/components/molecules/ticket-frame";

const meta = {
  component: TicketFrame,
  tags: ["ai-generated"],
} satisfies Meta<typeof TicketFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

// Event-detail single-pass CTA: TicketFrame wraps the "Book Tickets" button,
// rendering the gold border with left/right edge notches.
export const BookTicketsButton: Story = {
  render: () => (
    <div className="max-w-xs">
      <TicketFrame className="w-full">
        <ButtonLink
          href="#"
          variant="ticket"
          shape="ticket"
          className="w-full"
        >
          Book Tickets
        </ButtonLink>
      </TicketFrame>
    </div>
  ),
};
