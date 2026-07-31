-- Run in WKSP_GCODE2 SQL Workshop, after 01_tables.sql.
-- Fully additive: only touches the new GCODE_COUPONS* tables and calls the existing
-- public GCODE_EVENT_PARTICIPANTS_API.CREATE_PARTICIPANT (signature verified live).
-- Does NOT modify GCODE_PAYMENTS_API - see 04_create_order_patch_note.md for that touchpoint.

CREATE OR REPLACE PACKAGE GCODE_COUPONS_API AS

  PROCEDURE create_coupon(
    p_event_id        IN  NUMBER,
    p_code            IN  VARCHAR2,
    p_discount_type   IN  VARCHAR2,
    p_discount_value  IN  NUMBER,
    p_max_redemptions IN  NUMBER   DEFAULT NULL,
    p_valid_from      IN  TIMESTAMP DEFAULT NULL,
    p_valid_to        IN  TIMESTAMP DEFAULT NULL,
    p_created_by      IN  NUMBER   DEFAULT NULL,
    p_coupon_id       OUT NUMBER
  );

  PROCEDURE list_coupons_for_event(
    p_event_id IN  NUMBER,
    p_result   OUT SYS_REFCURSOR
  );

  PROCEDURE deactivate_coupon(
    p_coupon_id IN NUMBER
  );

  -- Pure validation + pricing. Does not touch redemption count or create a participant.
  -- p_error_code is NULL on success, else one of:
  --   NOT_FOUND | INACTIVE | NOT_YET_VALID | EXPIRED | EXHAUSTED | ALREADY_USED
  -- Signed-in users have no email JWT claim (see src/lib/auth/session.ts) - pass
  -- p_user_id instead and this resolves the real email from gcode_users itself,
  -- same as GCODE_PAYMENTS_API.create_order already does. p_email is used as-is
  -- for guests (p_user_id NULL). At least one of the two must resolve to a value.
  PROCEDURE validate_coupon(
    p_event_id        IN  NUMBER,
    p_code            IN  VARCHAR2,
    p_email           IN  VARCHAR2 DEFAULT NULL,
    p_category        IN  VARCHAR2 DEFAULT 'ATTENDEE',
    p_quantity        IN  NUMBER   DEFAULT 1,
    p_user_id         IN  NUMBER   DEFAULT NULL,
    p_coupon_id       OUT NUMBER,
    p_discount_type   OUT VARCHAR2,
    p_discount_value  OUT NUMBER,
    p_original_amount OUT NUMBER,
    p_final_amount    OUT NUMBER,
    p_error_code      OUT VARCHAR2
  );

  -- For a 100%-off (or fully-covering) coupon: skips Razorpay, registers the participant
  -- directly via GCODE_EVENT_PARTICIPANTS_API.CREATE_PARTICIPANT, and records the redemption.
  -- Caller must have already run validate_coupon and confirmed p_final_amount = 0.
  PROCEDURE redeem_free_coupon(
    p_coupon_id      IN  NUMBER,
    p_event_id       IN  NUMBER,
    p_email          IN  VARCHAR2,
    p_full_name      IN  VARCHAR2,
    p_quantity       IN  NUMBER,
    p_category       IN  VARCHAR2,
    p_phone          IN  VARCHAR2 DEFAULT NULL,
    p_user_id        IN  NUMBER   DEFAULT NULL,
    p_participant_id OUT NUMBER
  );

  -- For a partially-discounted coupon whose Razorpay order was created and paid for
  -- (real amount > 0): call this from wherever the payment gets verified, to record
  -- the redemption + bump the counter. Idempotent per (coupon, email).
  PROCEDURE record_paid_redemption(
    p_coupon_id IN NUMBER,
    p_email     IN VARCHAR2,
    p_order_id  IN VARCHAR2
  );

END GCODE_COUPONS_API;
/

CREATE OR REPLACE PACKAGE BODY GCODE_COUPONS_API AS

  PROCEDURE create_coupon(
    p_event_id        IN  NUMBER,
    p_code            IN  VARCHAR2,
    p_discount_type   IN  VARCHAR2,
    p_discount_value  IN  NUMBER,
    p_max_redemptions IN  NUMBER   DEFAULT NULL,
    p_valid_from      IN  TIMESTAMP DEFAULT NULL,
    p_valid_to        IN  TIMESTAMP DEFAULT NULL,
    p_created_by      IN  NUMBER   DEFAULT NULL,
    p_coupon_id       OUT NUMBER
  ) IS
  BEGIN
    INSERT INTO GCODE_COUPONS (
      event_id, code, discount_type, discount_value,
      max_redemptions, valid_from, valid_to, created_by
    ) VALUES (
      p_event_id, UPPER(p_code), UPPER(p_discount_type), p_discount_value,
      p_max_redemptions, p_valid_from, p_valid_to, p_created_by
    )
    RETURNING id INTO p_coupon_id;
  END create_coupon;

  PROCEDURE list_coupons_for_event(
    p_event_id IN  NUMBER,
    p_result   OUT SYS_REFCURSOR
  ) IS
  BEGIN
    OPEN p_result FOR
      SELECT
        c.id, c.event_id, c.code, c.discount_type, c.discount_value,
        c.max_redemptions, c.redemption_count, c.valid_from, c.valid_to,
        c.is_active, c.created_on,
        CASE
          WHEN c.is_active = 0 THEN 'INACTIVE'
          WHEN c.valid_to IS NOT NULL AND c.valid_to < SYSTIMESTAMP THEN 'EXPIRED'
          WHEN c.valid_from IS NOT NULL AND c.valid_from > SYSTIMESTAMP THEN 'SCHEDULED'
          WHEN c.max_redemptions IS NOT NULL AND c.redemption_count >= c.max_redemptions THEN 'EXHAUSTED'
          ELSE 'ACTIVE'
        END AS computed_status
      FROM GCODE_COUPONS c
      WHERE c.event_id = p_event_id
      ORDER BY c.created_on DESC;
  END list_coupons_for_event;

  PROCEDURE deactivate_coupon(
    p_coupon_id IN NUMBER
  ) IS
  BEGIN
    UPDATE GCODE_COUPONS SET is_active = 0 WHERE id = p_coupon_id;
  END deactivate_coupon;

  PROCEDURE validate_coupon(
    p_event_id        IN  NUMBER,
    p_code            IN  VARCHAR2,
    p_email           IN  VARCHAR2 DEFAULT NULL,
    p_category        IN  VARCHAR2 DEFAULT 'ATTENDEE',
    p_quantity        IN  NUMBER   DEFAULT 1,
    p_user_id         IN  NUMBER   DEFAULT NULL,
    p_coupon_id       OUT NUMBER,
    p_discount_type   OUT VARCHAR2,
    p_discount_value  OUT NUMBER,
    p_original_amount OUT NUMBER,
    p_final_amount    OUT NUMBER,
    p_error_code      OUT VARCHAR2
  ) IS
    l_is_active        NUMBER;
    l_valid_from        TIMESTAMP;
    l_valid_to          TIMESTAMP;
    l_max_redemptions   NUMBER;
    l_redemption_count  NUMBER;
    l_already_used      NUMBER;
    l_unit_price        NUMBER;
    l_email             VARCHAR2(255) := p_email;
  BEGIN
    p_error_code := NULL;

    IF p_user_id IS NOT NULL THEN
      SELECT email INTO l_email FROM gcode_users WHERE user_id = p_user_id;
    END IF;

    BEGIN
      SELECT id, discount_type, discount_value, is_active,
             valid_from, valid_to, max_redemptions, redemption_count
        INTO p_coupon_id, p_discount_type, p_discount_value, l_is_active,
             l_valid_from, l_valid_to, l_max_redemptions, l_redemption_count
        FROM GCODE_COUPONS
       WHERE event_id = p_event_id AND code = UPPER(p_code);
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        p_error_code := 'NOT_FOUND';
        RETURN;
    END;

    IF l_is_active = 0 THEN
      p_error_code := 'INACTIVE';
      RETURN;
    END IF;

    IF l_valid_from IS NOT NULL AND l_valid_from > SYSTIMESTAMP THEN
      p_error_code := 'NOT_YET_VALID';
      RETURN;
    END IF;

    IF l_valid_to IS NOT NULL AND l_valid_to < SYSTIMESTAMP THEN
      p_error_code := 'EXPIRED';
      RETURN;
    END IF;

    IF l_max_redemptions IS NOT NULL AND l_redemption_count >= l_max_redemptions THEN
      p_error_code := 'EXHAUSTED';
      RETURN;
    END IF;

    SELECT COUNT(*) INTO l_already_used
      FROM GCODE_COUPON_REDEMPTIONS
     WHERE coupon_id = p_coupon_id AND LOWER(email) = LOWER(l_email);

    IF l_already_used > 0 THEN
      p_error_code := 'ALREADY_USED';
      RETURN;
    END IF;

    SELECT CASE UPPER(p_category)
             WHEN 'PARTICIPANT' THEN participant_price
             ELSE ticket_price
           END
      INTO l_unit_price
      FROM EVENTS
     WHERE id = p_event_id;

    p_original_amount := NVL(l_unit_price, 0) * p_quantity;

    IF p_discount_type = 'PERCENT' THEN
      p_final_amount := p_original_amount - (p_original_amount * p_discount_value / 100);
    ELSE
      p_final_amount := p_original_amount - p_discount_value;
    END IF;

    IF p_final_amount < 0 THEN
      p_final_amount := 0;
    END IF;
  END validate_coupon;

  PROCEDURE redeem_free_coupon(
    p_coupon_id      IN  NUMBER,
    p_event_id       IN  NUMBER,
    p_email          IN  VARCHAR2,
    p_full_name      IN  VARCHAR2,
    p_quantity       IN  NUMBER,
    p_category       IN  VARCHAR2,
    p_phone          IN  VARCHAR2 DEFAULT NULL,
    p_user_id        IN  NUMBER   DEFAULT NULL,
    p_participant_id OUT NUMBER
  ) IS
  BEGIN
    GCODE_EVENT_PARTICIPANTS_API.create_participant(
      p_event_id            => p_event_id,
      p_email               => p_email,
      p_full_name           => p_full_name,
      p_quantity            => p_quantity,
      p_status              => 'PENDING',
      p_active              => 'Y',
      p_category            => p_category,
      p_phone               => p_phone,
      p_user_id             => p_user_id,
      p_skip_window_check   => 'Y',
      p_id                  => p_participant_id
    );

    INSERT INTO GCODE_COUPON_REDEMPTIONS (coupon_id, email, order_id)
    VALUES (p_coupon_id, p_email, NULL);

    UPDATE GCODE_COUPONS
       SET redemption_count = redemption_count + 1
     WHERE id = p_coupon_id;
  END redeem_free_coupon;

  PROCEDURE record_paid_redemption(
    p_coupon_id IN NUMBER,
    p_email     IN VARCHAR2,
    p_order_id  IN VARCHAR2
  ) IS
  BEGIN
    INSERT INTO GCODE_COUPON_REDEMPTIONS (coupon_id, email, order_id)
    VALUES (p_coupon_id, p_email, p_order_id);

    UPDATE GCODE_COUPONS
       SET redemption_count = redemption_count + 1
     WHERE id = p_coupon_id;
  EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
      NULL; -- already recorded (retry/duplicate webhook) - idempotent no-op
  END record_paid_redemption;

END GCODE_COUPONS_API;
/
