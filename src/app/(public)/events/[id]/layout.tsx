import type { Metadata } from "next";
import { getEvent } from "@/lib/api/events";
import { resolveImageUrl } from "@/lib/api/adapters";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const detail = await getEvent(id);
    const title = `${detail.event_name} | GCODE Events`;
    const description =
      (detail.description ?? "").trim().slice(0, 160) ||
      "Discover this event on GCODE Events.";
    const image = resolveImageUrl(detail.cover_image_url);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [{ url: image }] : undefined,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
