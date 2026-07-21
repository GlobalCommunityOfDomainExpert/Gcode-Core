import { NextRequest, NextResponse } from "next/server";
import { commitAudioMultipartUpload } from "@/lib/oci/object-storage";
import { submitParticipantAudio } from "@/lib/api/participants";

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

  const { uploadId, parts } = await request.json().catch(() => ({}));
  if (!uploadId || !Array.isArray(parts) || parts.length === 0) {
    return NextResponse.json(
      { error: "Missing upload metadata" },
      { status: 400 },
    );
  }

  try {
    const objectUrl = await commitAudioMultipartUpload(id, uploadId, parts);
    const result = await submitParticipantAudio(id, objectUrl);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[audio-submission/multipart/complete]", err);
    return NextResponse.json(
      { error: "Couldn't save your submission. Please try again." },
      { status: 502 },
    );
  }
}
