import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormSectionHeading } from "./form-section-heading";

const meta = {
  component: FormSectionHeading,
  tags: ["ai-generated"],
  args: { title: "Basic Information" },
} satisfies Meta<typeof FormSectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
