import { NextRequest, NextResponse } from "next/server";
import { uploadAudioObject } from "@/lib/oci/object-storage";
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

  const contentType = request.headers.get("content-type") || "audio/webm";
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length === 0) {
    return NextResponse.json({ error: "Empty recording" }, { status: 400 });
  }

  try {
    const objectUrl = await uploadAudioObject(id, body, contentType);
    const result = await submitParticipantAudio(id, objectUrl);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[audio-submission]", err);
    return NextResponse.json(
      { error: "Couldn't save your submission. Please try again." },
      { status: 502 },
    );
  }
}
