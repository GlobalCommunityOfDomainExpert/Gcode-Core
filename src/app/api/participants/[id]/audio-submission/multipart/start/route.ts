import { NextRequest, NextResponse } from "next/server";
import { startAudioMultipartUpload } from "@/lib/oci/object-storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing participant id" },
      { status: 400 },
    );
  }

  const { contentType } = await request
    .json()
    .catch(() => ({ contentType: "audio/webm" }));

  try {
    const uploadId = await startAudioMultipartUpload(
      id,
      contentType || "audio/webm",
    );
    return NextResponse.json({ uploadId });
  } catch (err) {
    console.error("[audio-submission/multipart/start]", err);
    return NextResponse.json(
      { error: "Couldn't save your submission. Please try again." },
      { status: 502 },
    );
  }
}
