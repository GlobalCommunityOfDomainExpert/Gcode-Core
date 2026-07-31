-- Run in WKSP_GCODE2 SQL Workshop, after 01_tables.sql (needs GCODE_UPI_PAYMENT_CLAIMS).
-- Fully additive. confirm_upi_claim reuses GCODE_EVENT_PARTICIPANTS_API.CREATE_PARTICIPANT
-- directly (same free-registration shape as GCODE_COUPONS_API.redeem_free_coupon) - there is
-- no cryptographic verification of the UTR here, confirmation is a manual trust step by
-- whoever calls confirm_upi_claim (they must check the bank/Razorpay settlement themselves).

CREATE OR REPLACE PACKAGE GCODE_UPI_CLAIMS_API AS

  PROCEDURE submit_upi_claim(
    p_event_id       IN  NUMBER,
    p_email          IN  VARCHAR2,
    p_full_name      IN  VARCHAR2,
    p_utr            IN  VARCHAR2,
    p_amount_claimed IN  NUMBER,
    p_claim_id       OUT NUMBER
  );

  PROCEDURE list_upi_claims(
    p_event_id IN  NUMBER,
    p_result   OUT SYS_REFCURSOR
  );

  PROCEDURE confirm_upi_claim(
    p_claim_id       IN  NUMBER,
    p_reviewer_id    IN  NUMBER,
    p_quantity       IN  NUMBER DEFAULT 1,
    p_category       IN  VARCHAR2 DEFAULT 'ATTENDEE',
    p_phone          IN  VARCHAR2 DEFAULT NULL,
    p_user_id        IN  NUMBER DEFAULT NULL,
    p_participant_id OUT NUMBER
  );

  PROCEDURE reject_upi_claim(
    p_claim_id    IN NUMBER,
    p_reviewer_id IN NUMBER
  );

END GCODE_UPI_CLAIMS_API;
/

CREATE OR REPLACE PACKAGE BODY GCODE_UPI_CLAIMS_API AS

  PROCEDURE submit_upi_claim(
    p_event_id       IN  NUMBER,
    p_email          IN  VARCHAR2,
    p_full_name      IN  VARCHAR2,
    p_utr            IN  VARCHAR2,
    p_amount_claimed IN  NUMBER,
    p_claim_id       OUT NUMBER
  ) IS
  BEGIN
    INSERT INTO GCODE_UPI_PAYMENT_CLAIMS (event_id, email, full_name, utr, amount_claimed)
    VALUES (p_event_id, p_email, p_full_name, p_utr, p_amount_claimed)
    RETURNING id INTO p_claim_id;
  END submit_upi_claim;

  PROCEDURE list_upi_claims(
    p_event_id IN  NUMBER,
    p_result   OUT SYS_REFCURSOR
  ) IS
  BEGIN
    OPEN p_result FOR
      SELECT id, event_id, email, full_name, utr, amount_claimed, status,
             submitted_on, reviewed_by, reviewed_on, participant_id
        FROM GCODE_UPI_PAYMENT_CLAIMS
       WHERE event_id = p_event_id
       ORDER BY submitted_on DESC;
  END list_upi_claims;

  PROCEDURE confirm_upi_claim(
    p_claim_id       IN  NUMBER,
    p_reviewer_id    IN  NUMBER,
    p_quantity       IN  NUMBER DEFAULT 1,
    p_category       IN  VARCHAR2 DEFAULT 'ATTENDEE',
    p_phone          IN  VARCHAR2 DEFAULT NULL,
    p_user_id        IN  NUMBER DEFAULT NULL,
    p_participant_id OUT NUMBER
  ) IS
    l_event_id  NUMBER;
    l_email     VARCHAR2(255);
    l_full_name VARCHAR2(255);
    l_status    VARCHAR2(10);
  BEGIN
    SELECT event_id, email, full_name, status
      INTO l_event_id, l_email, l_full_name, l_status
      FROM GCODE_UPI_PAYMENT_CLAIMS
     WHERE id = p_claim_id
     FOR UPDATE;

    IF l_status != 'PENDING' THEN
      RAISE_APPLICATION_ERROR(-20001, 'Claim already ' || l_status);
    END IF;

    GCODE_EVENT_PARTICIPANTS_API.create_participant(
      p_event_id            => l_event_id,
      p_email               => l_email,
      p_full_name           => l_full_name,
      p_quantity            => p_quantity,
      p_status              => 'PENDING',
      p_active              => 'Y',
      p_category            => p_category,
      p_phone               => p_phone,
      p_user_id             => p_user_id,
      p_skip_window_check   => 'Y',
      p_id                  => p_participant_id
    );

    UPDATE GCODE_UPI_PAYMENT_CLAIMS
       SET status = 'CONFIRMED',
           reviewed_by = p_reviewer_id,
           reviewed_on = SYSTIMESTAMP,
           participant_id = p_participant_id
     WHERE id = p_claim_id;
  END confirm_upi_claim;

  PROCEDURE reject_upi_claim(
    p_claim_id    IN NUMBER,
    p_reviewer_id IN NUMBER
  ) IS
  BEGIN
    UPDATE GCODE_UPI_PAYMENT_CLAIMS
       SET status = 'REJECTED',
           reviewed_by = p_reviewer_id,
           reviewed_on = SYSTIMESTAMP
     WHERE id = p_claim_id AND status = 'PENDING';
  END reject_upi_claim;

END GCODE_UPI_CLAIMS_API;
/
