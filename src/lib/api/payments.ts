import { apiRequest, ApiError } from "./client";
import {
  CreateRazorpayOrderPayload,
  RazorpayOrderApi,
  VerifyRazorpayPaymentPayload,
} from "./types";

// Backend sizes the order off ticket_price * quantity and creates it with
// Razorpay server-side (holds the key secret) — this never sends an amount.
export async function createRazorpayOrder(
  eventId: number | string,
  payload: CreateRazorpayOrderPayload,
): Promise<RazorpayOrderApi> {
  const order = await apiRequest<RazorpayOrderApi | null>(
    `/events/${eventId}/razorpay-order`,
    { method: "POST", body: payload },
  );
  // ORDS has intermittently returned HTTP 200 with an empty body for this
  // endpoint (observed in testing, cause unconfirmed) — fail loudly here
  // instead of letting callers crash on order.key_id with no context.
  if (!order?.order_id) {
    throw new ApiError(
      "Payment order creation returned no data. Please try again.",
      502,
    );
  }
  return order;
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
