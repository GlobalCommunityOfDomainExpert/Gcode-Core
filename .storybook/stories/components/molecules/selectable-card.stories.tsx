import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Hammer, User, Users } from "lucide-react";
import { expect, fn } from "storybook/test";
import { SelectableCard } from "@/components/molecules/selectable-card";

const meta = {
  component: SelectableCard,
  tags: ["ai-generated"],
  args: {
    icon: Hammer,
    title: "Hackathon",
    subtitle: "Build sprint, team-based",
    onSelect: fn(),
  },
} satisfies Meta<typeof SelectableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = { args: { selected: false } };
export const Selected: Story = { args: { selected: true } };

export const ClickFiresOnSelect: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /hackathon/i }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

// Pass-type picker on the event detail page: icon avatar, radio-dot
// indicator, and a locked card with a status pill + tooltip.
export const PassPicker: Story = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <SelectableCard
        layout="horizontal"
        icon={User}
        title="Participants"
        subtitle="Nominate yourself for the karaoke singing contest."
        selected
        meta="₹199 · closes in 1d"
        onSelect={fn()}
      />
      <SelectableCard
        layout="horizontal"
        icon={Users}
        title="Audience"
        subtitle="Watch the live show and cheer on the performers."
        disabled
        statusLabel="opens in 7d"
        lockMessage="Audience registration unlocks in 7 days"
        meta="Free · 100 left"
        onSelect={fn()}
      />
    </div>
  ),
};
