import { apiRequest } from "./client";
import {
  ApiListResponse,
  CouponApi,
  CreateCouponPayload,
  ValidateCouponResponse,
} from "./types";
import { getSession } from "@/lib/auth/session";

// Contract-only — GCODE_COUPONS doesn't exist on the live backend yet, so
// this degrades to [] instead of throwing into whatever Promise.all it's
// called from (see project memory "contract-first-ords-endpoints").
export async function listCoupons(
  eventId: number | string,
): Promise<CouponApi[]> {
  try {
    const { items } = await apiRequest<ApiListResponse<CouponApi>>(
      `/events/${eventId}/coupons`,
    );
    return items;
  } catch {
    return [];
  }
}

// Organizer-only — not degrade-safe, the organizer needs to see a real
// error if this fails, same as invitePanelist. created_by comes from the
// caller's own session, same trust level as invitePanelist's invited_by
// (this backend doesn't verify bearer tokens server-side).
export function createCoupon(
  eventId: number | string,
  payload: CreateCouponPayload,
): Promise<CouponApi> {
  const createdBy = getSession()?.userId ?? "";
  return apiRequest(`/events/${eventId}/coupons`, {
    method: "POST",
    body: { ...payload, created_by: createdBy },
  });
}

// Organizer-only — soft-deactivates a coupon (GCODE_COUPONS.IS_ACTIVE = 0),
// existing redemptions/audit trail are kept.
export function deactivateCoupon(couponId: number | string): Promise<unknown> {
  return apiRequest(`/coupons/${couponId}`, { method: "PUT" });
}

// Public — pre-checkout pricing check. Informational only: the same
// validation re-runs server-side inside create_order/redeem_free_coupon, so
// a tampered response here can't produce a discount that isn't also applied
// (and re-checked) server-side.
// identity mirrors register/page.tsx's own identityPayload() union — signed-in
// users have no email JWT claim (see auth/session.ts), so user_id is resolved
// to a real email server-side (GCODE_COUPONS_API.validate_coupon), same as
// GCODE_PAYMENTS_API.create_order already does for guests vs accounts.
export function validateCoupon(
  eventId: number | string,
  code: string,
  identity: { user_id: string } | { email: string },
  category: "ATTENDEE" | "PARTICIPANT",
  quantity: number,
): Promise<ValidateCouponResponse> {
  return apiRequest(`/events/${eventId}/coupons/validate`, {
    method: "POST",
    body: { code, ...identity, category, quantity },
  });
}
