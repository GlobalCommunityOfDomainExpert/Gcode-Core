# Discount coupon + offline UPI claim backend

Run in this order, in WKSP_GCODE2 SQL Workshop (the ATHARVA MCP connection has no
`CREATE ANY TABLE`/`CREATE ANY PROCEDURE` privilege into WKSP_GCODE2 — confirmed via
`session_privs`, matches memory `db_schema_wksp_gcode2.md` — so these can't be run for you
from here, only verified read-side afterward):

1. `01_tables.sql` — `GCODE_COUPONS`, `GCODE_COUPON_REDEMPTIONS`, `GCODE_UPI_PAYMENT_CLAIMS`
2. `02_gcode_coupons_api.sql` — coupon CRUD + validate + free-redemption logic (additive, safe)
3. `03_gcode_upi_claims_api.sql` — offline UPI claim submit/list/confirm/reject (additive, safe)
4. `06_patched_gcode_payments_api.sql` — full `GCODE_PAYMENTS_API` body with the coupon
   touchpoint applied (adds `COUPON_ID` to `GCODE_PAYMENT_ORDERS`, re-prices `create_order`
   when a coupon is passed, bumps redemption count in `finalize_order` so both the
   `verify_and_register` AND `process_webhook` confirmation paths are covered). Needs
   `GCODE_COUPONS_API` (step 2) already compiled. **You also need to add
   `p_coupon_code IN VARCHAR2 DEFAULT NULL` to the `create_order` declaration in the
   package spec** — I only saw the body, not the spec header (see `04_create_order_patch_note.md`).
5. `05_ords_endpoints.md` — routes to expose once 1-4 are compiled.

Free-ticket coupons (100% off) and confirmed UPI claims don't touch `CREATE_ORDER` at all —
they skip Razorpay and register the participant directly via the existing
`GCODE_EVENT_PARTICIPANTS_API.CREATE_PARTICIPANT` (signature verified live, unchanged).

Once 1-3 are compiled, tell me and I'll run read-only `SELECT`/direct proc-call tests via
the MCP connection to confirm they work before we wire up ORDS + frontend.
