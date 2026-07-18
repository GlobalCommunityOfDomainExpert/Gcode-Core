import { apiRequest } from "./client";
import {
  ApiListResponse,
  CreateParticipantPayload,
  MyParticipationApi,
  ParticipantApi,
} from "./types";

// Guest registration: no sign-in required. Server finds-or-creates the
// GCODE_USERS row by email and links it to the new participant row.
export function registerForEvent(
  eventId: number | string,
  payload: CreateParticipantPayload,
): Promise<{ participant_id: number }> {
  return apiRequest(`/events/${eventId}/participants`, {
    method: "POST",
    body: payload,
  });
}

export async function listParticipants(
  eventId: number | string,
): Promise<ParticipantApi[]> {
  const { items } = await apiRequest<ApiListResponse<ParticipantApi>>(
    `/events/${eventId}/participants`,
  );
  return items;
}

export async function getParticipant(
  id: number | string,
): Promise<ParticipantApi | undefined> {
  const { items } = await apiRequest<{ items: ParticipantApi[] }>(
    `/participants/${id}`,
  );
  return items[0];
}

// Registrations for the signed-in user, joined to their events. Backend
// resolves user_id from the token itself (AUTH_PKG.get_verified_user_id) —
// this just carries the token as a query param, not the user_id.
export async function listMyParticipations(
  token: string,
): Promise<MyParticipationApi[]> {
  const { items } = await apiRequest<ApiListResponse<MyParticipationApi>>(
    "/participants/mine",
    { query: { p_token: token } },
  );
  return items;
}

// Persists the final audio location on the participant row. Unlike the
// read-side degrade-to-default convention elsewhere in this file, a failure
// here must reach the caller — the participant needs to know their
// submission didn't save before the 24h deadline passes.
export function submitParticipantAudio(
  id: number | string,
  audioUrl: string,
): Promise<{ audio_submission_url: string; audio_submitted_on: string }> {
  return apiRequest(`/participants/${id}/audio-submission`, {
    method: "PUT",
    body: { audio_submission_url: audioUrl },
  });
}

// Sends the recorded blob to our own Next.js API route, which uploads it to
// OCI Object Storage server-side and persists the resulting URL — avoids a
// direct browser-to-OCI PUT, which needs a CORS rule on the bucket that
// wasn't available to set up.
export async function uploadParticipantAudio(
  id: number | string,
  blob: Blob,
): Promise<{ audio_submission_url: string; audio_submitted_on: string }> {
  const res = await fetch(`/api/participants/${id}/audio-submission`, {
    method: "POST",
    headers: { "Content-Type": blob.type || "audio/webm" },
    body: blob,
  });
  if (!res.ok) {
    throw new Error("Couldn't save your submission. Please try again.");
  }
  return res.json();
}
