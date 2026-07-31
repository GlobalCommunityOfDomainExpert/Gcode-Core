# ORDS endpoints to add

My DB connection can't introspect how existing ORDS routes are defined (`apex_rest_resource_modules`/
`_handlers` return 0 rows for this session — see memory `apex_rest_metadata_views.md` and
`db_schema_wksp_gcode2.md`), so these need to be wired up wherever the existing `/events/{id}/razorpay-order`
and `/participants/razorpay` routes live (APEX REST Workshop or `ords.define_module` script — whichever
the existing routes use).

Base path matches existing convention: `.../ords/wksp_gcode2/v1`

| Method | Path | Body | Calls | Notes |
|---|---|---|---|---|
| POST | `/events/{id}/coupons` | `{code, discount_type, discount_value, max_redemptions?, valid_from?, valid_to?}` | `GCODE_COUPONS_API.create_coupon` | organizer-only — check `EVENTS.ORGANIZER_ID` matches caller, same pattern as other organizer-gated routes |
| GET | `/events/{id}/coupons` | — | `GCODE_COUPONS_API.list_coupons_for_event` | organizer-only |
| PATCH | `/coupons/{id}` | `{}` (deactivate only) | `GCODE_COUPONS_API.deactivate_coupon` | organizer-only |
| POST | `/events/{id}/coupons/validate` | `{code, email, category, quantity}` | `GCODE_COUPONS_API.validate_coupon` | public. Map `p_error_code` to 4xx + message. Response: `{coupon_id, discount_type, discount_value, original_amount, final_amount}` |
| POST | `/events/{id}/razorpay-order` (extend existing) | add optional `coupon_code` to existing body | if `final_amount=0` after validating → `GCODE_COUPONS_API.redeem_free_coupon`, return `{free: true, participant_id}`; else → patched `GCODE_PAYMENTS_API.CREATE_ORDER` (see `04_create_order_patch_note.md`) | existing route, needs branching logic added at the ORDS/handler layer |
| POST | `/events/{id}/upi-claims` | `{email, full_name, utr, amount_claimed}` | `GCODE_UPI_CLAIMS_API.submit_upi_claim` | public |
| GET | `/events/{id}/upi-claims` | — | `GCODE_UPI_CLAIMS_API.list_upi_claims` | organizer-only |
| PATCH | `/upi-claims/{id}` | `{action: 'confirm' \| 'reject'}` | `GCODE_UPI_CLAIMS_API.confirm_upi_claim` / `reject_upi_claim` | organizer-only. `confirm` needs the reviewer's `USER_ID` — same big-number precision issue as elsewhere, cast to TEXT in the JSON response (see memory `user_id_json_precision_bug.md`) |

Response body convention: match whatever the events/payments module already uses — memory
`ords_response_body_pattern.md` says that module uses `APEX_JSON.write`, so mirror that rather
than introducing a different response shape.
