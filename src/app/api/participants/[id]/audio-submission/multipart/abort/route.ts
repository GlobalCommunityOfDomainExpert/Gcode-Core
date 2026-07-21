import { NextRequest, NextResponse } from "next/server";
import { abortAudioMultipartUpload } from "@/lib/oci/object-storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { uploadId } = await request.json().catch(() => ({}));
  if (!id || !uploadId) {
    return NextResponse.json(
      { error: "Missing upload metadata" },
      { status: 400 },
    );
  }

  try {
    await abortAudioMultipartUpload(id, uploadId);
  } catch (err) {
    // Best-effort cleanup — the client already failed and is surfacing its
    // own error; a stray incomplete multipart upload isn't worth retrying.
    console.error("[audio-submission/multipart/abort]", err);
  }
  return NextResponse.json({ ok: true });
}
