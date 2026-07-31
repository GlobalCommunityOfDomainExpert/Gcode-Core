-- Run in WKSP_GCODE2 SQL Workshop, AFTER 01_tables.sql + 02_gcode_coupons_api.sql
-- (this body calls GCODE_COUPONS_API, so that package must already exist).
--
-- This is the full current GCODE_PAYMENTS_API body (as provided), with three
-- additive changes and nothing else touched:
--   1. ALTER TABLE to add GCODE_PAYMENT_ORDERS.COUPON_ID.
--   2. create_order gets an optional p_coupon_code param that re-prices the
--      order via GCODE_COUPONS_API.validate_coupon when present.
--   3. finalize_order (shared by both verify_and_register AND
--      process_webhook - confirmed both call it) records the redemption via
--      GCODE_COUPONS_API.record_paid_redemption when the order carried a
--      coupon. Since both payment-confirmation paths funnel through
--      finalize_order, this one change covers both without duplicating it.
--
-- A coupon that fully covers the price (final_amount <= 0) is intentionally
-- rejected here with an error - that case should never reach create_order at
-- all; the ORDS/handler layer should call GCODE_COUPONS_API.validate_coupon
-- itself first and route to GCODE_COUPONS_API.redeem_free_coupon instead,
-- skipping Razorpay entirely (see 05_ords_endpoints.md).

ALTER TABLE GCODE_PAYMENT_ORDERS ADD (COUPON_ID NUMBER REFERENCES GCODE_COUPONS(ID));

create or replace PACKAGE BODY GCODE_PAYMENTS_API AS

  FUNCTION get_secret(p_name VARCHAR2) RETURN VARCHAR2 IS
    v_val GCODE_APP_SECRETS.secret_value%TYPE;
  BEGIN
    SELECT secret_value INTO v_val FROM GCODE_APP_SECRETS WHERE secret_name = p_name;
    RETURN v_val;
  END get_secret;

  FUNCTION sha256(p_data RAW) RETURN RAW IS
    v_hash RAW(32);
  BEGIN
    SELECT STANDARD_HASH(p_data, 'SHA256') INTO v_hash FROM DUAL;
    RETURN v_hash;
  END sha256;

  FUNCTION normalize_key(p_key_raw RAW) RETURN RAW IS
    v_key RAW(2000) := p_key_raw;
    v_len PLS_INTEGER;
  BEGIN
    IF UTL_RAW.LENGTH(v_key) > 64 THEN
      v_key := sha256(v_key);
    END IF;
    v_len := UTL_RAW.LENGTH(v_key);
    IF v_len < 64 THEN
      v_key := UTL_RAW.CONCAT(v_key, HEXTORAW(RPAD('00', (64 - v_len) * 2, '00')));
    END IF;
    RETURN v_key;
  END normalize_key;

  FUNCTION hmac_hex(p_payload VARCHAR2, p_key VARCHAR2) RETURN VARCHAR2 IS
    C_BLOCK_SIZE CONSTANT PLS_INTEGER := 64;
    v_key     RAW(2000);
    v_opad    RAW(64) := HEXTORAW(RPAD('5C', C_BLOCK_SIZE * 2, '5C'));
    v_ipad    RAW(64) := HEXTORAW(RPAD('36', C_BLOCK_SIZE * 2, '36'));
    v_okeypad RAW(2000);
    v_ikeypad RAW(2000);
    v_inner   RAW(32);
  BEGIN
    v_key     := normalize_key(UTL_RAW.CAST_TO_RAW(p_key));
    v_okeypad := UTL_RAW.BIT_XOR(v_key, v_opad);
    v_ikeypad := UTL_RAW.BIT_XOR(v_key, v_ipad);
    v_inner   := sha256(UTL_RAW.CONCAT(v_ikeypad, UTL_RAW.CAST_TO_RAW(p_payload)));
    RETURN LOWER(RAWTOHEX(sha256(UTL_RAW.CONCAT(v_okeypad, v_inner))));
  END hmac_hex;

  FUNCTION basic_auth_header RETURN VARCHAR2 IS
  BEGIN
    RETURN 'Basic ' || REPLACE(REPLACE(UTL_RAW.CAST_TO_VARCHAR2(
      UTL_ENCODE.BASE64_ENCODE(UTL_RAW.CAST_TO_RAW(
        get_secret('RAZORPAY_KEY_ID') || ':' || get_secret('RAZORPAY_KEY_SECRET')
      ))
    ), CHR(10), ''), CHR(13), '');
  END basic_auth_header;

  FUNCTION finalize_order(
    p_razorpay_order_id   VARCHAR2,
    p_razorpay_payment_id VARCHAR2
  ) RETURN NUMBER IS
    v_row                 GCODE_PAYMENT_ORDERS%ROWTYPE;
    v_already_registered  VARCHAR2(1);
  BEGIN
    SELECT * INTO v_row
      FROM GCODE_PAYMENT_ORDERS
     WHERE razorpay_order_id = p_razorpay_order_id
     FOR UPDATE;

    IF v_row.status = 'PAID' THEN
      RETURN v_row.participant_id;
    END IF;

    GCODE_EVENT_PARTICIPANTS_API.create_participant(
      p_event_id            => v_row.event_id,
      p_email               => v_row.email,
      p_full_name           => v_row.full_name,
      p_quantity            => v_row.quantity,
      p_status              => 'CONFIRMED',
      p_category            => NVL(v_row.category, 'ATTENDEE'),
      p_phone               => v_row.phone,
      p_skip_window_check   => 'Y',
      p_id                  => v_row.participant_id
    );

    UPDATE GCODE_PAYMENT_ORDERS
       SET status = 'PAID',
           razorpay_payment_id = p_razorpay_payment_id,
           participant_id = v_row.participant_id,
           paid_on = SYSTIMESTAMP
     WHERE id = v_row.id;

    -- New: bump the coupon's redemption count once the payment is actually
    -- confirmed (not at order-creation time). record_paid_redemption is
    -- idempotent per (coupon_id, order_id), so a webhook retry after
    -- verify_and_register already ran (or vice versa) is a safe no-op.
    IF v_row.coupon_id IS NOT NULL THEN
      GCODE_COUPONS_API.record_paid_redemption(
        p_coupon_id => v_row.coupon_id,
        p_email     => v_row.email,
        p_order_id  => p_razorpay_order_id
      );
    END IF;

    RETURN v_row.participant_id;
  END finalize_order;

  PROCEDURE create_order(
    p_event_id     IN NUMBER,
    p_email        IN VARCHAR2 DEFAULT NULL,
    p_full_name    IN VARCHAR2 DEFAULT NULL,
    p_quantity     IN NUMBER,
    p_category     IN VARCHAR2 DEFAULT 'ATTENDEE',
    p_phone        IN VARCHAR2 DEFAULT NULL,
    p_user_id      IN NUMBER   DEFAULT NULL,
    p_coupon_code  IN VARCHAR2 DEFAULT NULL,
    p_order_id     OUT VARCHAR2,
    p_amount       OUT NUMBER,
    p_currency     OUT VARCHAR2,
    p_key_id       OUT VARCHAR2
  ) IS
    v_ticket_price      EVENTS.ticket_price%TYPE;
    v_participant_price EVENTS.participant_price%TYPE;
    v_price             NUMBER;
    v_amount_paise      NUMBER;
    v_req_body          CLOB;
    v_resp              CLOB;
    v_order_id          VARCHAR2(64);
    v_category          VARCHAR2(20) := NVL(p_category, 'ATTENDEE');
    v_email             gcode_users.email%TYPE := p_email;
    v_full_name         gcode_users.full_name%TYPE := p_full_name;
    v_phone             gcode_users.phone%TYPE := p_phone;
    l_coupon_id         GCODE_COUPONS.id%TYPE;
    l_discount_type     GCODE_COUPONS.discount_type%TYPE;
    l_discount_value    GCODE_COUPONS.discount_value%TYPE;
    l_original_amount   NUMBER;
    l_final_amount      NUMBER;
    l_coupon_error      VARCHAR2(30);
  BEGIN
    IF p_quantity IS NULL OR p_quantity < 1 THEN
      RAISE_APPLICATION_ERROR(-20001, 'Quantity must be at least 1.');
    END IF;

    IF p_user_id IS NOT NULL THEN
      SELECT email, full_name, phone
      INTO   v_email, v_full_name, v_phone
      FROM   gcode_users
      WHERE  user_id = p_user_id;
    END IF;

    SELECT ticket_price, participant_price
    INTO   v_ticket_price, v_participant_price
    FROM   EVENTS WHERE id = p_event_id;

    v_price := CASE WHEN v_category = 'PARTICIPANT' THEN v_participant_price ELSE v_ticket_price END;

    IF v_price IS NULL OR v_price <= 0 THEN
      RAISE_APPLICATION_ERROR(-20001, 'Event is free — no payment order needed.');
    END IF;

    v_amount_paise := ROUND(v_price * p_quantity * 100);

    -- New: coupon re-pricing. A coupon that fully covers the price must not
    -- reach here at all - the caller (ORDS handler) should validate first
    -- and route to GCODE_COUPONS_API.redeem_free_coupon instead. This is a
    -- defensive check, not the primary free-path (see 05_ords_endpoints.md).
    IF p_coupon_code IS NOT NULL THEN
      GCODE_COUPONS_API.validate_coupon(
        p_event_id        => p_event_id,
        p_code            => p_coupon_code,
        p_email           => v_email,
        p_category        => v_category,
        p_quantity        => p_quantity,
        p_coupon_id       => l_coupon_id,
        p_discount_type   => l_discount_type,
        p_discount_value  => l_discount_value,
        p_original_amount => l_original_amount,
        p_final_amount    => l_final_amount,
        p_error_code      => l_coupon_error
      );

      IF l_coupon_error IS NOT NULL THEN
        RAISE_APPLICATION_ERROR(-20002, 'Invalid coupon: ' || l_coupon_error);
      END IF;

      IF l_final_amount <= 0 THEN
        RAISE_APPLICATION_ERROR(-20003,
          'This coupon fully covers the price — use the free-registration path instead of a Razorpay order.');
      END IF;

      v_amount_paise := ROUND(l_final_amount * 100);
    END IF;

    v_req_body := JSON_OBJECT(
      'amount'   VALUE v_amount_paise,
      'currency' VALUE 'INR',
      'receipt'  VALUE 'evt' || p_event_id || '-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3')
    );

    APEX_WEB_SERVICE.g_request_headers.DELETE;
    APEX_WEB_SERVICE.g_request_headers(1).name  := 'Authorization';
    APEX_WEB_SERVICE.g_request_headers(1).value := basic_auth_header;

    v_resp := APEX_WEB_SERVICE.MAKE_REST_REQUEST(
      p_url         => 'https://api.razorpay.com/v1/orders',
      p_http_method => 'POST',
      p_body        => v_req_body
    );

    IF APEX_WEB_SERVICE.g_status_code NOT IN (200, 201) THEN
      RAISE_APPLICATION_ERROR(-20001, 'Razorpay order creation failed: ' || v_resp);
    END IF;

    APEX_JSON.PARSE(v_resp);
    v_order_id := APEX_JSON.get_varchar2(p_path => 'id');

    INSERT INTO GCODE_PAYMENT_ORDERS (
      event_id, razorpay_order_id, quantity, amount, currency, email, full_name,
      category, phone, coupon_id
    )
    VALUES (
      p_event_id, v_order_id, p_quantity, v_amount_paise, 'INR', v_email, v_full_name,
      v_category, v_phone, l_coupon_id
    );

    p_order_id := v_order_id;
    p_amount   := v_amount_paise;
    p_currency := 'INR';
    p_key_id   := get_secret('RAZORPAY_KEY_ID');
  END create_order;

  PROCEDURE verify_and_register(
    p_razorpay_order_id   IN VARCHAR2,
    p_razorpay_payment_id IN VARCHAR2,
    p_razorpay_signature  IN VARCHAR2,
    p_participant_id      OUT NUMBER
  ) IS
    v_expected VARCHAR2(64);
  BEGIN
    v_expected := hmac_hex(
      p_razorpay_order_id || '|' || p_razorpay_payment_id,
      get_secret('RAZORPAY_KEY_SECRET')
    );

    IF v_expected != LOWER(p_razorpay_signature) THEN
      RAISE_APPLICATION_ERROR(-20001, 'Payment verification failed.');
    END IF;

    p_participant_id := finalize_order(p_razorpay_order_id, p_razorpay_payment_id);
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20001, 'Payment order not found.');
  END verify_and_register;

  PROCEDURE process_webhook(
    p_payload           IN CLOB,
    p_webhook_signature IN VARCHAR2
  ) IS
    v_expected   VARCHAR2(64);
    v_event_id   VARCHAR2(64);
    v_event_type VARCHAR2(40);
    v_order_id   VARCHAR2(64);
    v_payment_id VARCHAR2(64);
  BEGIN
    v_expected := hmac_hex(p_payload, get_secret('RAZORPAY_WEBHOOK_SECRET'));
    IF v_expected != LOWER(p_webhook_signature) THEN
      RAISE_APPLICATION_ERROR(-20001, 'Webhook signature verification failed.');
    END IF;

    APEX_JSON.PARSE(p_payload);
    v_event_id   := APEX_JSON.get_varchar2(p_path => 'id');
    v_event_type := APEX_JSON.get_varchar2(p_path => 'event');
    v_order_id   := APEX_JSON.get_varchar2(p_path => 'payload.payment.entity.order_id');
    v_payment_id := APEX_JSON.get_varchar2(p_path => 'payload.payment.entity.id');

    BEGIN
      INSERT INTO GCODE_PAYMENT_EVENTS (razorpay_event_id, razorpay_order_id, event_type, payload)
      VALUES (v_event_id, v_order_id, v_event_type, p_payload);
    EXCEPTION
      WHEN DUP_VAL_ON_INDEX THEN
        RETURN;
    END;

    IF v_event_type = 'payment.captured' THEN
      DECLARE
        v_participant_id NUMBER;
      BEGIN
        v_participant_id := finalize_order(v_order_id, v_payment_id);
      EXCEPTION
        WHEN NO_DATA_FOUND THEN
          NULL;
      END;
    END IF;
  END process_webhook;

END GCODE_PAYMENTS_API;
/
