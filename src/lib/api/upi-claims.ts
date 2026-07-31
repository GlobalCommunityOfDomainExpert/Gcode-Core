import { apiRequest } from "./client";
import { ApiListResponse, SubmitUpiClaimPayload, UpiClaimApi } from "./types";
import { getSession } from "@/lib/auth/session";

// Contract-only — GCODE_UPI_PAYMENT_CLAIMS doesn't exist on the live
// backend yet, so this degrades to [] instead of throwing into whatever
// Promise.all it's called from (see project memory
// "contract-first-ords-endpoints").
export async function listUpiClaims(
  eventId: number | string,
): Promise<UpiClaimApi[]> {
  try {
    const { items } = await apiRequest<ApiListResponse<UpiClaimApi>>(
      `/events/${eventId}/upi-claims`,
    );
    return items;
  } catch {
    return [];
  }
}

// Public — attendee self-reports a claim after paying via the offline UPI
// QR at the venue. This is not a verified payment; it just queues a claim
// for the organizer to manually confirm against their own bank/Razorpay
// settlement.
export function submitUpiClaim(
  eventId: number | string,
  payload: SubmitUpiClaimPayload,
): Promise<UpiClaimApi> {
  return apiRequest(`/events/${eventId}/upi-claims`, {
    method: "POST",
    body: payload,
  });
}

// Organizer-only — confirming registers the participant directly
// (GCODE_UPI_CLAIMS_API.confirm_upi_claim), skipping Razorpay entirely.
// reviewer_id comes from the caller's own session, same trust level as
// respondToPanelistInvite's user_id (this backend doesn't verify bearer
// tokens server-side).
export function confirmUpiClaim(
  claimId: number | string,
): Promise<unknown> {
  const reviewerId = getSession()?.userId ?? "";
  return apiRequest(`/upi-claims/${claimId}`, {
    method: "PUT",
    body: { action: "confirm", reviewer_id: reviewerId },
  });
}

export function rejectUpiClaim(claimId: number | string): Promise<unknown> {
  const reviewerId = getSession()?.userId ?? "";
  return apiRequest(`/upi-claims/${claimId}`, {
    method: "PUT",
    body: { action: "reject", reviewer_id: reviewerId },
  });
}
