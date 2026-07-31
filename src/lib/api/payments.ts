import { apiRequest, ApiError } from "./client";
import {
  CreateRazorpayOrderPayload,
  CreateRazorpayOrderResult,
  RazorpayOrderApi,
  VerifyRazorpayPaymentPayload,
} from "./types";

// Backend sizes the order off ticket_price * quantity (minus any coupon
// discount) and creates it with Razorpay server-side (holds the key
// secret) — this never sends an amount. A coupon that fully covers the
// price short-circuits to a free registration instead of a Razorpay order
// (see FreeRegistrationApi) — callers must check `"free" in result` before
// treating this as a RazorpayOrderApi.
export async function createRazorpayOrder(
  eventId: number | string,
  payload: CreateRazorpayOrderPayload,
): Promise<CreateRazorpayOrderResult> {
  const result = await apiRequest<CreateRazorpayOrderResult | null>(
    `/events/${eventId}/razorpay-order`,
    { method: "POST", body: payload },
  );
  // ORDS has intermittently returned HTTP 200 with an empty body for this
  // endpoint (observed in testing, cause unconfirmed) — fail loudly here
  // instead of letting callers crash on order.key_id with no context.
  if (!result || (!("free" in result) && !(result as RazorpayOrderApi).order_id)) {
    throw new ApiError(
      "Payment order creation returned no data. Please try again.",
      502,
    );
  }
  return result;
}

// Backend verifies the Razorpay signature before creating the participant
// row, so a tampered/forged client response can't produce a free ticket.
// No event_id in the path — the signature alone (unforgeable without the
// key secret) already pins this to one specific order/event server-side.
export async function verifyRazorpayPayment(
  payload: VerifyRazorpayPaymentPayload,
): Promise<{ participant_id: number }> {
  const result = await apiRequest<{ participant_id: number } | null>(
    `/participants/razorpay`,
    { method: "POST", body: payload },
  );
  if (!result?.participant_id) {
    throw new ApiError(
      "Payment verification returned no data. Please try again.",
      502,
    );
  }
  return result;
}
