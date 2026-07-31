# Required touch on `GCODE_PAYMENTS_API.CREATE_ORDER` — RESOLVED

**Update:** you pasted the current body — the exact patch is now written out in full at
`06_patched_gcode_payments_api.sql`. Run that instead of hand-applying anything below;
this file is kept only for the reasoning/history. One thing still needed from you: the
package **spec** (header) also declares `create_order`'s parameter list, and I only saw
the body — add `p_coupon_code IN VARCHAR2 DEFAULT NULL` to the spec's `create_order`
declaration too (same position, right before the `OUT` params), or the body won't compile
against a mismatched spec.

Everything else in this folder (tables, `GCODE_COUPONS_API`, `GCODE_UPI_CLAIMS_API`) is
**additive** — new objects only, safe to run standalone. This one piece was not additive,
and needed the real body to patch safely instead of guessing.

## Why this can't be avoided

Partial-discount coupons (e.g. 20% off) still need a real Razorpay order for the
*discounted* amount. Only `GCODE_PAYMENTS_API.CREATE_ORDER` talks to Razorpay for event
registrations (confirmed: `RAZORPAY_UTIL` is a separate, unrelated package used by the
booking/consulting feature, not events) and only its body knows how it computes the
charged amount and calls Razorpay. There's no separate "just create a Razorpay order for
this amount" entry point to call instead.

My DB connection can read package **signatures** but not package **body source**
(`all_source`/`dbms_metadata.get_ddl` return nothing cross-schema for WKSP_GCODE2 - see
memory `db_schema_wksp_gcode2.md`), so I can't see or safely rewrite the existing logic.

## What to do

**Paste me the current `CREATE_ORDER` body** (from your SQL Workshop) and I'll write the
exact, minimal patch. If you'd rather apply it yourself, here's the shape of the change:

1. Add one new optional parameter:
   ```sql
   p_coupon_code IN VARCHAR2 DEFAULT NULL
   ```

2. Wherever the body currently computes the charged amount (something like
   `l_amount := l_ticket_price * p_quantity;`), change it to:
   ```sql
   l_amount := l_ticket_price * p_quantity; -- existing line, unchanged

   IF p_coupon_code IS NOT NULL THEN
     GCODE_COUPONS_API.validate_coupon(
       p_event_id        => p_event_id,
       p_code            => p_coupon_code,
       p_email           => p_email,
       p_category        => p_category,
       p_quantity        => p_quantity,
       p_coupon_id       => l_coupon_id,       -- new local NUMBER
       p_discount_type   => l_discount_type,   -- new local VARCHAR2
       p_discount_value  => l_discount_value,  -- new local NUMBER
       p_original_amount => l_original_amount, -- new local NUMBER
       p_final_amount    => l_amount,          -- OVERWRITES l_amount with the discounted total
       p_error_code      => l_coupon_error     -- new local VARCHAR2
     );

     IF l_coupon_error IS NOT NULL THEN
       RAISE_APPLICATION_ERROR(-20002, 'Invalid coupon: ' || l_coupon_error);
     END IF;
   END IF;
   ```

3. After the Razorpay order + `GCODE_PAYMENT_ORDERS` insert succeeds, if `l_coupon_id`
   is not null, stash it somewhere `verify_and_register` can see it when the payment
   comes back — either a new `COUPON_ID` column on `GCODE_PAYMENT_ORDERS` (cleanest), or
   look it up by `RAZORPAY_ORDER_ID` join at verify time. Recommend the column:
   ```sql
   ALTER TABLE GCODE_PAYMENT_ORDERS ADD (COUPON_ID NUMBER REFERENCES GCODE_COUPONS(ID));
   ```
   and set it in the same INSERT that creates the `GCODE_PAYMENT_ORDERS` row.

4. In `VERIFY_AND_REGISTER`, after the existing participant-creation + signature-verify
   succeeds, add:
   ```sql
   IF l_order.coupon_id IS NOT NULL THEN
     GCODE_COUPONS_API.record_paid_redemption(
       p_coupon_id => l_order.coupon_id,
       p_email     => l_order.email,
       p_order_id  => p_razorpay_order_id
     );
   END IF;
   ```

## Also flag: `PROCESS_WEBHOOK`

I found a third procedure, `GCODE_PAYMENTS_API.PROCESS_WEBHOOK(p_payload, p_webhook_signature)`,
that I didn't know about going in - likely a Razorpay webhook handler that may *also*
finalize registration/payment independently of `VERIFY_AND_REGISTER` (as a reliability
backstop for abandoned client-side flows). If it duplicates any participant-creation or
order-completion logic, the same `record_paid_redemption` call needs to go there too,
guarded the same way — otherwise a payment finalized only via webhook would skip
redemption bookkeeping (redemption count would under-count, and a user could reuse a
coupon that should already show as spent). Worth telling me what this procedure does
before I finalize the redemption plumbing.

## Zero-amount path

For a 100%-off coupon, `CREATE_ORDER` doesn't need to be touched — the frontend calls a
new `validate_coupon` check first; if `final_amount = 0`, the frontend/ORDS layer calls
`GCODE_COUPONS_API.redeem_free_coupon` directly and never calls `CREATE_ORDER` at all,
skipping Razorpay entirely. Only the partial-discount (amount > 0) path needs the
`CREATE_ORDER` patch above.
