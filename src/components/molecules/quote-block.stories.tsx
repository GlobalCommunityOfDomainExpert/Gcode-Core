import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QuoteBlock } from "./quote-block";

const meta = {
  component: QuoteBlock,
  tags: ["ai-generated"],
  args: {
    children: "A B2B SaaS platform for sustainable packaging supply chains.",
  },
} satisfies Meta<typeof QuoteBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
