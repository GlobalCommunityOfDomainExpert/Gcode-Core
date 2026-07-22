import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MediaUploadFields } from "@/components/molecules/media-upload-fields";

const meta = {
  component: MediaUploadFields,
  tags: ["ai-generated"],
  args: {
    bannerLabel: "Profile Banner",
    bannerPlaceholder: "Click to upload banner image",
    bannerHint: "1500 x 500px recommended",
    photoLabel: "Profile Photo",
    photoInitials: "AS",
    photoHint: "Recommended size: 400x400px (JPG or PNG)",
  },
} satisfies Meta<typeof MediaUploadFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Circle: Story = {};

export const Square: Story = {
  args: {
    photoShape: "square",
    photoButtonLabel: "Upload Logo",
    photoInitials: "LK",
  },
};
