import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/atoms";
import { ProblemCard } from "./problem-card";

const meta = {
  component: ProblemCard,
  tags: ["ai-generated"],
  args: {
    tags: [
      { label: "AI/ML", tone: "primary" },
      { label: "Systems", tone: "neutral" },
    ],
    matchedReason: "Domain Expert in AI/ML",
    title: "How to reduce inference latency for a 7B parameter model?",
    snippet: "Tried quantization and batching, still seeing 800ms p99.",
    actions: (
      <>
        <Button size="sm" variant="primary">
          Respond
        </Button>
        <Button size="sm" variant="ghost">
          Pass
        </Button>
      </>
    ),
  },
} satisfies Meta<typeof ProblemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomSnippetLabel: Story = {
  args: { snippetLabel: "Context:" },
};
