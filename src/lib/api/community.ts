import { apiRequest } from "./client";
import { ApiListResponse } from "./types";

// Mirrors COMMUNITY_REQUESTS row shape returned by ORDS.
export interface CommunityRequestApi {
  id: number;
  event_id: number;
  stakeholder_id: string;
  category: string;
  message: string | null;
  status: string;
  response_message: string | null;
  created_at: string;
  responded_at: string | null;
  reminded_at: string | null;
}

export interface NewCommunityRequest {
  stakeholderId: string;
  category: string;
  message: string;
}

export function createCommunityRequests(
  eventId: number | string,
  items: NewCommunityRequest[],
): Promise<unknown> {
  return apiRequest(`/events/${eventId}/community-requests`, {
    method: "POST",
    body: items,
  });
}

export async function listCommunityRequests(
  eventId: number | string,
): Promise<CommunityRequestApi[]> {
  const { items } = await apiRequest<ApiListResponse<CommunityRequestApi>>(
    `/events/${eventId}/community-requests`,
  );
  return items;
}

export async function getCommunityRequest(
  id: number | string,
): Promise<CommunityRequestApi | undefined> {
  const { items } = await apiRequest<{ items: CommunityRequestApi[] }>(
    `/community-requests/${id}`,
  );
  return items[0];
}

export function respondToCommunityRequest(
  id: number | string,
  status: string,
  responseMessage: string,
): Promise<void> {
  return apiRequest<void>(`/community-requests/${id}`, {
    method: "PUT",
    body: { status, responseMessage },
  });
}

export function remindCommunityRequest(id: number | string): Promise<unknown> {
  return apiRequest(`/community-requests/${id}/remind`, {
    method: "POST",
    body: {},
  });
}

export function deleteCommunityRequest(id: number | string): Promise<void> {
  return apiRequest<void>(`/community-requests/${id}`, { method: "DELETE" });
}
