import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Carousel } from "@/components/molecules/carousel";

const meta = {
  component: Carousel,
  tags: ["ai-generated"],
  args: { children: [] },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const cards = ["Hackathon", "Expert AMA", "Webinar", "Ideathon", "Meetup"].map(
  (label) => (
    <div
      key={label}
      className="border-border-light bg-surface-light rounded-md border p-6 text-center"
    >
      {label}
    </div>
  ),
);

export const Default: Story = {
  // Narrow wrapper guarantees the 5 cards overflow, so Next/Prev actually appear.
  render: (args) => (
    <div style={{ width: 320 }}>
      <Carousel {...args}>{cards}</Carousel>
    </div>
  ),
};

export const NextButtonScrollsTrack: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Carousel {...args}>{cards}</Carousel>
    </div>
  ),
  play: async ({ canvas }) => {
    const next = await canvas.findByRole("button", { name: /next/i });
    const previous = canvas.getByRole("button", { name: /previous/i });
    await expect(previous).toBeDisabled();

    await next.click();

    // Previous becomes enabled only once the track has actually scrolled
    // past the first stop — proves the click moved the carousel, not just
    // that the button is clickable.
    await expect(previous).not.toBeDisabled();
  },
};

export const SingleItemHasNoControls: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Carousel {...args}>{[cards[0]]}</Carousel>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: /next/i }),
    ).not.toBeInTheDocument();
  },
};
