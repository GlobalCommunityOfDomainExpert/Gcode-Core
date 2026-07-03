import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  CommunityRequest,
  CommunityRequestStatus,
} from "@/lib/community-requests";

interface CommunityRequestsState {
  requests: CommunityRequest[];
  requestCounter: number;
}

interface CommunityRequestsActions {
  addRequest: (input: {
    eventId: string;
    stakeholderId: string;
    category: CommunityRequest["category"];
    message: string;
  }) => CommunityRequest;
  respondToRequest: (
    id: string,
    status: "interested" | "passed",
    responseMessage?: string,
  ) => CommunityRequest | undefined;
  confirmRequest: (id: string) => CommunityRequest | undefined;
  removeRequest: (id: string) => void;
  nudgeRequest: (id: string) => CommunityRequest | undefined;
}

function patchRequest(
  requests: CommunityRequest[],
  id: string,
  updates: Partial<CommunityRequest>,
): { requests: CommunityRequest[]; updated?: CommunityRequest } {
  let updated: CommunityRequest | undefined;
  const next = requests.map((request) => {
    if (request.id !== id) return request;
    updated = { ...request, ...updates };
    return updated;
  });
  return { requests: next, updated };
}

export const useCommunityRequestsStore = create<
  CommunityRequestsState & CommunityRequestsActions
>()(
  devtools(
    (set, get) => ({
      requests: [],
      requestCounter: 0,

      addRequest: (input) => {
        const counter = get().requestCounter + 1;
        const request: CommunityRequest = {
          id: `req-${counter}`,
          status: "interested" as CommunityRequestStatus,
          createdAt: new Date().toISOString(),
          ...input,
        };
        set(
          (state) => ({
            requests: [...state.requests, request],
            requestCounter: counter,
          }),
          false,
          "addRequest",
        );
        return request;
      },

      respondToRequest: (id, status, responseMessage) => {
        let updated: CommunityRequest | undefined;
        set(
          (state) => {
            const result = patchRequest(state.requests, id, {
              status,
              responseMessage,
              respondedAt: new Date().toISOString(),
            });
            updated = result.updated;
            return { requests: result.requests };
          },
          false,
          "respondToRequest",
        );
        return updated;
      },

      confirmRequest: (id) => {
        let updated: CommunityRequest | undefined;
        set(
          (state) => {
            const result = patchRequest(state.requests, id, {
              status: "helping",
            });
            updated = result.updated;
            return { requests: result.requests };
          },
          false,
          "confirmRequest",
        );
        return updated;
      },

      removeRequest: (id) =>
        set(
          (state) => ({
            requests: state.requests.filter((request) => request.id !== id),
          }),
          false,
          "removeRequest",
        ),

      nudgeRequest: (id) => {
        let updated: CommunityRequest | undefined;
        set(
          (state) => {
            const result = patchRequest(state.requests, id, {
              remindedAt: new Date().toISOString(),
            });
            updated = result.updated;
            return { requests: result.requests };
          },
          false,
          "nudgeRequest",
        );
        return updated;
      },
    }),
    {
      name: "community-requests-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

export function getCommunityRequestsByEvent(
  eventId: string,
): CommunityRequest[] {
  return useCommunityRequestsStore
    .getState()
    .requests.filter((request) => request.eventId === eventId);
}

export function useCommunityRequestsByEvent(
  eventId: string,
): CommunityRequest[] {
  return useCommunityRequestsStore(
    useShallow((state) =>
      state.requests.filter((request) => request.eventId === eventId),
    ),
  );
}

export function getCommunityRequestById(
  id: string,
): CommunityRequest | undefined {
  return useCommunityRequestsStore
    .getState()
    .requests.find((request) => request.id === id);
}
