import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { QrPlaceholder } from "./qr-placeholder";

const meta = {
  component: QrPlaceholder,
  tags: ["ai-generated"],
} satisfies Meta<typeof QrPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: /qr code placeholder/i }),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("status", { name: /loading qr code/i }),
    ).toBeVisible();
  },
};
