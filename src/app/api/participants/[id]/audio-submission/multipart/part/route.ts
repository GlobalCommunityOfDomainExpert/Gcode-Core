import { NextRequest, NextResponse } from "next/server";
import { uploadAudioPart } from "@/lib/oci/object-storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const uploadId = request.headers.get("x-upload-id");
  const partNum = Number(request.headers.get("x-part-number"));
  const contentType = request.headers.get("x-audio-content-type") || "audio/webm";
  if (!id || !uploadId || !partNum) {
    return NextResponse.json(
      { error: "Missing upload metadata" },
      { status: 400 },
    );
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (body.length === 0) {
    return NextResponse.json({ error: "Empty chunk" }, { status: 400 });
  }

  try {
    const etag = await uploadAudioPart(id, uploadId, partNum, body, contentType);
    return NextResponse.json({ etag });
  } catch (err) {
    console.error("[audio-submission/multipart/part]", err);
    return NextResponse.json(
      { error: "Couldn't save your submission. Please try again." },
      { status: 502 },
    );
  }
}
