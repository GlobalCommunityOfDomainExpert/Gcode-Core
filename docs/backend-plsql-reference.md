# Backend PL/SQL Reference

Point-in-time snapshot of the Oracle/APEX package bodies as of 2026-07-23 — source of truth is the Oracle workspace, not this repo; re-sync this file if the backend changes. Companion to [`backend-integration-strategy.md`](./backend-integration-strategy.md) and [`oracle-adb-schema-gap-prompt.md`](./oracle-adb-schema-gap-prompt.md), which describe the frontend↔backend contract from the Next.js side; this doc describes the same system from the Oracle side — what each package actually does, not just its shape.

## Architecture

```
Next.js (this repo)  --HTTP-->  ORDS (Oracle REST Data Services)  -->  PL/SQL package procedure  -->  Oracle ADB tables
                                                                              |
                                                                              +--> GCODE_EMAIL_API (APEX_MAIL)
                                                                              +--> external REST (Razorpay, Google, and — once
                                                                                   built — WhatsApp Cloud API)
```

- The frontend never talks to the database directly — every call in `src/lib/api/*.ts` hits an ORDS URL, which is bound to one of the procedures documented below.
- ORDS convention: a procedure takes `p_status_code OUT NUMBER` and writes its JSON response itself via `HTP.print(...)` (see `AUTH_PKG`), **or** returns a `SYS_REFCURSOR`/scalar `OUT` params that ORDS serializes automatically (see `gcode_events_api`, `gcode_event_participants_api`). Both styles are in use — check the specific procedure before assuming one.
- Side-effecting sends (email today, WhatsApp once built) are always wrapped in their own `BEGIN...EXCEPTION WHEN OTHERS THEN NULL END` block after the primary `COMMIT` — a failed send never rolls back or fails the registration/submission itself. This is a deliberate reliability choice, not an oversight.

## Package index

| Package | Responsibility |
| --- | --- |
| `AUTH_PKG` | JWT issuance/verification, OTP-based guest/sign-up flow (email + WhatsApp phone OTP), sign-in, Google OAuth, password reset |
| `gcode_events_api` | Event CRUD, timeline/social-links/media replace-all, category assignment |
| `gcode_event_participants_api` | Registration (`create_participant`), audio submission (`submit_audio`), attendee listing |
| `GCODE_PAYMENTS_API` | Razorpay order creation, HMAC signature verification, webhook handling — delegates to `gcode_event_participants_api.create_participant` on successful payment |
| `GCODE_EMAIL_API` | All outbound email — shared HTML layout (`wrap_layout`) plus one `send_*` procedure per email type |
| `GCODE_WHATSAPP_API` | All outbound WhatsApp — Meta Cloud API sends via `APEX_WEB_SERVICE`, one `send_*` procedure per message type. Deployed and wired into `gcode_event_participants_api.create_participant`/`submit_audio` |

## Who calls whom (the sends that matter for the WhatsApp work)

| Trigger (frontend call) | ORDS endpoint | PL/SQL entry point | Email sent |
| --- | --- | --- | --- |
| `registerForEvent()` (`src/lib/api/participants.ts:11`) | `POST /events/{id}/participants` | `gcode_event_participants_api.create_participant` | `GCODE_EMAIL_API.send_confirmation_email` — ticket/booking confirmation |
| `submitParticipantAudio()` (`src/lib/api/participants.ts:56`) | `PUT /participants/{id}/audio-submission` | `gcode_event_participants_api.submit_audio` | `GCODE_EMAIL_API.send_submission_received_email` |
| Razorpay webhook / `verify-and-register` | `POST /payments/webhook`, `.../verify` | `GCODE_PAYMENTS_API.process_webhook` / `verify_and_register` → `finalize_order` → `create_participant` | same as row 1 — paid registrations go through the identical email |
| `sendGuestOtp()` / `signUp()` (`src/lib/api/auth.ts`) | `POST /auth/guest-otp`, `POST /auth/sign-up` | `AUTH_PKG.send_guest_otp` / `sign_up` | `GCODE_EMAIL_API.send_otp_email` — **out of scope for the WhatsApp channel work, stays email-only** |
| `requestPasswordReset()` | `POST /auth/forgot-password` | `AUTH_PKG.request_password_reset` | `GCODE_EMAIL_API.send_reset_email` |
| *(no frontend caller found in this snapshot)* | — | — | `GCODE_EMAIL_API.send_rating_invite_email` — likely triggered from a ratings-related package not included in what was pasted; note the gap rather than guess |

These first two rows (plus the payment-webhook path, which is the same code) are the send points the WhatsApp work touches. **Design — fully deployed as of this snapshot** (see the plan file for the original diff/reasoning): email stays unconditional at both points; a `GCODE_WHATSAPP_API.send_ticket_confirmation`/`send_submission_received` call has been added *alongside* it in `gcode_event_participants_api`, firing only when the participant's `gcode_users.is_phone_verified = 'Y'` — an opt-in checkbox on the registration form is what triggers phone verification in the first place. WhatsApp is always additive, never a replacement for email. Phone OTP itself is `AUTH_PKG.send_phone_otp`/`verify_phone_otp` — same package as the existing email OTP, not a separate one (a reversed decision from an earlier iteration of this doc — see the plan file for why). **Only remaining piece: the two ORDS endpoints** (`/auth/phone-otp`, `/auth/verify-phone-otp`) binding to those new `AUTH_PKG` procedures — not yet created.

## GCODE_EMAIL_API

Shared HTML-email layer. `wrap_layout()` builds the common header/accent-bar/signature/footer shell (GCODE branding, dark-mode-aware inline CSS); every `send_*` procedure below builds its own `l_content` CLOB and passes it through `wrap_layout()`, then dispatches via `APEX_MAIL.SEND` + `APEX_MAIL.PUSH_QUEUE`. All mail is sent from `no-reply@gcode.in` inside the `GCODE` APEX workspace (looked up via `apex_applications` by `alias = 'GCODE'`, then `APEX_UTIL.SET_SECURITY_GROUP_ID` — required before `APEX_MAIL.SEND` will work outside an actual APEX session).

| Procedure | Params | Purpose | Called from |
| --- | --- | --- | --- |
| `wrap_layout` | `p_page_title`, `p_ref_line`, `p_heading`, `p_content` | Internal — renders the shared HTML shell around one email's content | Every `send_*` proc below |
| `send_confirmation_email` | `p_email`, `p_full_name`, `p_event_id`, `p_participant_id`, `p_quantity`, `p_category` | Ticket confirmation: looks up event pricing/label by category, renders a QR code (via `api.qrserver.com`, not generated locally) and an order-summary card | `gcode_event_participants_api.create_participant` |
| `send_submission_received_email` | `p_email`, `p_full_name`, `p_event_id`, `p_participant_id`, `p_audio_url` | Confirms a Participant-category audio submission was received; links straight to `p_audio_url` | `gcode_event_participants_api.submit_audio` |
| `send_otp_email` | `p_email`, `p_full_name`, `p_otp_code` | 6-character OTP, 15-minute expiry note | `AUTH_PKG.send_guest_otp`, `AUTH_PKG.sign_up` |
| `send_reset_email` | `p_email`, `p_full_name`, `p_reset_link` | Password-reset link, 30-minute expiry note | `AUTH_PKG.request_password_reset` |
| `send_rating_invite_email` | `p_email`, `p_full_name`, `p_event_id`, `p_attendee_id` | Live-rating link (`/events/{id}/rate?aid=`) for an in-progress event | Not present in this snapshot — flagged above |

**Relevant to the WhatsApp work:** `send_confirmation_email` and `send_submission_received_email` are the two procedures a channel branch needs to sit alongside (see the plan's `GCODE_WHATSAPP_API.send_ticket_confirmation` / `send_submission_received` counterparts). `send_otp_email` and `send_reset_email` stay untouched — verification/reset explicitly stays email-only.

<details>
<summary>Full source</summary>

## GCODE_EMAIL_API

```sql
create or replace PACKAGE BODY GCODE_EMAIL_API AS

  ----------------------------------------------------------------------------
  -- Shared layout: header / accent bar / signature / footer are identical
  -- across every GCODE mail. Only the heading + main content block differs.
  ----------------------------------------------------------------------------
  FUNCTION wrap_layout(
    p_page_title IN VARCHAR2,
    p_ref_line   IN VARCHAR2,
    p_heading    IN VARCHAR2,  -- raw inner HTML of the <h1>
    p_content    IN CLOB       -- paragraphs + card markup between heading and signature
  ) RETURN CLOB IS
  BEGIN
    RETURN
    '<!doctype html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>' || p_page_title || '</title>
    <style>
      [data-ogsc] .dark-section,
      [data-ogsb] .dark-section {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      @media (prefers-color-scheme: dark) {
        .dark-section { background-color: #000000 !important; color: #ffffff !important; }
      }
      @media only screen and (max-width: 620px) {
        .outer-td { padding: 16px 8px !important; }
        .inner-table { width: 100% !important; }
        .header-td { padding: 24px 20px 18px !important; }
        .body-td { padding: 28px 20px 24px !important; }
        .divider-td { padding: 0 20px !important; }
        .footer-td { padding: 18px 20px !important; }
        .h1 { font-size: 18px !important; }
        .body-p { font-size: 14px !important; }
        .qr-img { width: 160px !important; height: 160px !important; }
      }
    </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;">
    <tr>
    <td align="center" class="outer-td" style="padding:32px 16px;">
    <table class="inner-table" width="620" cellpadding="0" cellspacing="0" border="0"
           style="max-width:620px;width:100%;background:#ffffff;border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.14);">

    <!-- HEADER -->
    <tr>
    <td class="header-td dark-section" style="background:#000000;padding:32px 40px 24px;text-align:center;">
    <p style="margin:0;font-size:26px;font-weight:800;letter-spacing:1px;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      <span style="color:#cc0000;">G</span><span style="color:#ffffff;">CODE</span>
    </p>
    <p style="margin:12px 0 0;font-size:13px;letter-spacing:1.5px;font-family:Arial,sans-serif;color:#ffffff;">
      CONNECT | COLLABORATE | CONTRIBUTE
    </p>
    <div style="width:80px;height:2px;background:#cc0000;margin:20px auto 0;border-radius:1px;"></div>
    </td>
    </tr>

    <!-- ACCENT BAR -->
    <tr>
    <td style="background:#cc0000;padding:9px 40px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ffffff;font-weight:700;font-family:Arial,sans-serif;">
      ' || p_ref_line || '
    </p>
    </td>
    </tr>

    <!-- BODY -->
    <tr>
    <td class="body-td" style="padding:40px 44px 32px;">
    <h1 class="h1" style="margin:0 0 24px;font-size:21px;font-weight:700;color:#111111;line-height:1.4;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      ' || p_heading || '
    </h1>

    ' || p_content || '

    <!-- Signature -->
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
    <tr>
    <td style="border-left:4px solid #cc0000;padding-left:16px;">
    <p style="margin:0 0 6px;font-size:14px;color:#666666;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">Warm regards,</p>
    <p style="margin:0 0 3px;font-size:17px;font-weight:800;color:#000000;letter-spacing:0.5px;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;line-height:1.3;">
      Team <strong><span style="color:#cc0000;">G</span>CODE</strong>
    </p>
    <p style="margin:0 0 2px;font-size:14px;font-weight:500;color:#333333;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">Bengaluru, Karnataka</p>
    </td>
    </tr>
    </table>

    </td>
    </tr>

    <!-- DIVIDER -->
    <tr>
    <td class="divider-td" style="padding:0 44px;">
    <div style="height:1px;background:linear-gradient(to right,#cc0000,#888888,transparent);"></div>
    </td>
    </tr>

    <!-- FOOTER -->
    <tr>
    <td class="footer-td dark-section" style="background:#000000;padding:22px 44px;text-align:center;">
    <p style="margin:0 0 5px;font-size:12px;font-weight:800;letter-spacing:3px;color:#cc0000;font-family:Arial,sans-serif;">
      G<span style="color:#ffffff;">CODE</span> &nbsp;|&nbsp; POWER IT UP
    </p>
    <p style="margin:0;font-size:11px;color:#777777;line-height:1.6;font-family:Arial,sans-serif;">
      Empowering Institutions &nbsp;&bull;&nbsp; Students &nbsp;&bull;&nbsp; Startups &nbsp;&bull;&nbsp; Corporate Ecosystem
    </p>
    </td>
    </tr>

    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>';
  END wrap_layout;

  ----------------------------------------------------------------------------

  PROCEDURE send_confirmation_email(
    p_email          IN VARCHAR2,
    p_full_name      IN VARCHAR2,
    p_event_id       IN NUMBER,
    p_participant_id IN NUMBER,
    p_quantity       IN NUMBER,
    p_category       IN VARCHAR2
  ) IS
    l_workspace_id NUMBER;
    l_from_email   VARCHAR2(128);
    l_body         CLOB;
    l_html         CLOB;
    l_content      CLOB;
    l_mail_id      NUMBER;
    v_title        events.title%TYPE;
    v_start_date   events.start_date%TYPE;
    v_city         events.city%TYPE;
    v_venue        events.venue_address%TYPE;
    v_attendee_label     events.attendee_label%TYPE;
    v_participant_label  events.participant_label%TYPE;
    v_ticket_price       events.ticket_price%TYPE;
    v_participant_price  events.participant_price%TYPE;
    v_price        NUMBER;
    v_amount_txt   VARCHAR2(100);
    v_pass_label   VARCHAR2(200);
    v_when_date    VARCHAR2(100);
    v_when_time    VARCHAR2(100);
    v_where        VARCHAR2(500);
    v_ref_line     VARCHAR2(200);
    v_booking_ref  VARCHAR2(40) := 'GCODE-P' || p_participant_id;
    v_qr_payload   VARCHAR2(100) := 'GCODE-PARTICIPANT-' || p_participant_id;
    v_qr_url       VARCHAR2(500);
    v_ticket_url   VARCHAR2(500);
  BEGIN
    SELECT title, start_date, city, venue_address,
           NVL(attendee_label, 'Attendee'), NVL(participant_label, 'Participant'),
           ticket_price, participant_price
    INTO   v_title, v_start_date, v_city, v_venue,
           v_attendee_label, v_participant_label,
           v_ticket_price, v_participant_price
    FROM   events
    WHERE  id = p_event_id;

    v_pass_label := CASE WHEN p_category = 'PARTICIPANT'
                         THEN v_participant_label ELSE v_attendee_label END;
    v_price := CASE WHEN p_category = 'PARTICIPANT' THEN v_participant_price ELSE v_ticket_price END;
    v_amount_txt := CASE WHEN v_price IS NULL THEN 'N/A'
                         ELSE '₹' || TO_CHAR(v_price * NVL(p_quantity, 1), 'FM999999990.00') END;

    v_when_date := CASE WHEN v_start_date IS NOT NULL THEN TO_CHAR(v_start_date, 'DD Mon YYYY') ELSE 'TBA' END;
    v_when_time := CASE WHEN v_start_date IS NOT NULL THEN TO_CHAR(v_start_date, 'HH24:MI') || ' IST' ELSE '' END;
    v_where := NVL(v_venue, v_city);
    v_ref_line := 'Reference: ' || v_title || ', ' || v_when_date;

    v_qr_url := 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='
                || APEX_UTIL.URL_ENCODE(v_qr_payload);
    v_ticket_url := 'https://events.gcode.in/events/' || p_event_id
                    || '/registered?pid=' || p_participant_id;

    l_content :=
    '<p class="body-p" style="margin:0 0 18px;font-size:15px;color:#222222;line-height:1.7;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Dear <strong>' || NVL(p_full_name, 'there') || '</strong>,
    </p>
    <p class="body-p" style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Thank you for participating in <strong style="color:#111111;">' || v_title || '</strong>, organized by
      <strong><span style="color:#cc0000;">G</span>CODE</strong>. Your registration is confirmed. Please find your
      entry ticket QR code below &mdash; present it at the venue for a quick and seamless check-in.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px;background:#0d0d0d;border-radius:10px;">
    <tr>
    <td style="padding:26px 26px 6px;text-align:center;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#2ecc71;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">Your booking is confirmed!</p>
      <p style="margin:0;font-size:12px;letter-spacing:1px;color:#999999;font-family:Arial,sans-serif;">
        BOOKING ID <strong style="color:#ffffff;letter-spacing:1.5px;">' || v_booking_ref || '</strong>
      </p>
    </td>
    </tr>
    <tr>
    <td style="padding:18px 26px 6px;">
      <p style="margin:0 0 6px;font-size:17px;font-weight:800;color:#ffffff;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">' || v_title || '</p>
      <p style="margin:0 0 4px;font-size:13px;color:#cccccc;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">' || v_when_time || ' &nbsp;|&nbsp; ' || v_when_date || '</p>
      <p style="margin:0;font-size:12px;color:#999999;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">' || NVL(v_where, 'Venue TBA') || '</p>
    </td>
    </tr>
    <tr>
    <td style="padding:18px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="16" style="line-height:0;font-size:0;"><div style="width:16px;height:16px;background:#ffffff;border-radius:0 16px 16px 0;"></div></td>
        <td style="border-top:2px dashed #333333;"></td>
        <td width="16" style="line-height:0;font-size:0;"><div style="width:16px;height:16px;background:#ffffff;border-radius:16px 0 0 16px;"></div></td>
      </tr>
      </table>
    </td>
    </tr>
    <tr>
    <td style="padding:6px 26px 28px;text-align:center;">
      <img src="' || v_qr_url || '" alt="Ticket QR Code" width="170" class="qr-img"
           style="display:block;margin:0 auto 12px;width:170px;height:170px;background:#ffffff;padding:10px;border-radius:6px;" />
      <p style="margin:0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#777777;font-family:Arial,sans-serif;">Scan this QR at entry</p>
    </td>
    </tr>
    </table>

    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px;">
    <tr>
    <td style="border-left:4px solid #cc0000;padding-left:16px;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#111111;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">Order Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#444444;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      <tr><td style="padding:2px 0;">Ticket Type</td><td style="padding:2px 0;" align="right">' || v_pass_label || '</td></tr>
      <tr><td style="padding:2px 0;">Quantity</td><td style="padding:2px 0;" align="right">' || p_quantity || '</td></tr>
      <tr>
        <td style="padding-top:8px;border-top:1px dashed #dddddd;font-weight:700;color:#111111;">Amount Paid</td>
        <td style="padding-top:8px;border-top:1px dashed #dddddd;font-weight:700;color:#111111;" align="right">' || v_amount_txt || '</td>
      </tr>
      </table>
    </td>
    </tr>
    </table>

    <p class="body-p" style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Please keep this ticket handy on your phone or as a printout. Entry will be validated by scanning the QR code above.
    </p>
    <p class="body-p" style="margin:0 0 32px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      For more details you may visit <a href="' || v_ticket_url || '">your ticket page</a>. We look forward to seeing you there!
    </p>';

    l_html := wrap_layout(
      p_page_title => 'GCODE Booking Confirmation',
      p_ref_line   => v_ref_line,
      p_heading    => 'Thank You for Registering<br/><span style="color:#cc0000;">Here Is Your Event Ticket</span>',
      p_content    => l_content
    );

    SELECT workspace_id
      INTO l_workspace_id
      FROM apex_applications
     WHERE alias = 'GCODE'
     FETCH FIRST 1 ROWS ONLY;

    APEX_UTIL.SET_SECURITY_GROUP_ID(l_workspace_id);
    l_from_email := 'no-reply@gcode.in';

    l_body := 'You''re registered for ' || v_title || '. Booking reference: ' || v_booking_ref || '. View your ticket: ' || v_ticket_url;

    l_mail_id := APEX_MAIL.SEND(
      p_to        => p_email,
      p_from      => l_from_email,
      p_subj      => 'You''re registered for ' || v_title,
      p_body      => l_body,
      p_body_html => l_html
    );

    APEX_MAIL.PUSH_QUEUE;
  END send_confirmation_email;

  ----------------------------------------------------------------------------

  PROCEDURE send_submission_received_email(
    p_email          IN VARCHAR2,
    p_full_name      IN VARCHAR2,
    p_event_id       IN NUMBER,
    p_participant_id IN NUMBER,
    p_audio_url IN VARCHAR2
  ) IS
    l_workspace_id NUMBER;
    l_from_email   VARCHAR2(128);
    l_body         CLOB;
    l_html         CLOB;
    l_content      CLOB;
    l_mail_id      NUMBER;
    v_title        events.title%TYPE;
    v_info_url     VARCHAR2(500);
    v_submission_ref VARCHAR2(40) := 'GCODE-S' || p_participant_id;
  BEGIN
    SELECT title INTO v_title FROM events WHERE id = p_event_id;

    v_info_url := p_audio_url;

    l_content :=
    '<p class="body-p" style="margin:0 0 18px;font-size:15px;color:#222222;line-height:1.7;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Dear <strong>' || NVL(p_full_name, 'there') || '</strong>,
    </p>
    <p class="body-p" style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      We&rsquo;ve received your submission for <strong style="color:#111111;">' || v_title || '</strong>, organized by
      <strong><span style="color:#cc0000;">G</span>CODE</strong>. Our team will review it, and if selected, we&rsquo;ll be in touch.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px;background:#0d0d0d;border-radius:10px;">
    <tr>
    <td style="padding:26px;text-align:center;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#2ecc71;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">&#10003; Submission received</p>
      <p style="margin:0;font-size:12px;letter-spacing:1px;color:#999999;font-family:Arial,sans-serif;">
        SUBMISSION ID <strong style="color:#ffffff;letter-spacing:1.5px;">' || v_submission_ref || '</strong>
      </p>
      <p style="margin:12px 0 0;font-size:17px;font-weight:800;color:#ffffff;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">' || v_title || '</p>
    </td>
    </tr>
    </table>

    <div style="text-align:center;margin:0 0 28px;">
    <a href="' || v_info_url || '" style="display:inline-block;background:#cc0000;color:#ffffff;padding:14px 32px;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      View Submission
    </a>
    </div>';

    l_html := wrap_layout(
      p_page_title => 'GCODE Submission Received',
      p_ref_line   => 'Reference: ' || v_title,
      p_heading    => 'Submission Received<br/><span style="color:#cc0000;">We&rsquo;ll Be In Touch</span>',
      p_content    => l_content
    );

    SELECT workspace_id
      INTO l_workspace_id
      FROM apex_applications
     WHERE alias = 'GCODE'
     FETCH FIRST 1 ROWS ONLY;

    APEX_UTIL.SET_SECURITY_GROUP_ID(l_workspace_id);
    l_from_email := 'no-reply@gcode.in';

    l_body := 'We''ve received your submission for ' || v_title || '. View it: ' || v_info_url;

    l_mail_id := APEX_MAIL.SEND(
      p_to        => p_email,
      p_from      => l_from_email,
      p_subj      => 'We''ve received your submission — ' || v_title,
      p_body      => l_body,
      p_body_html => l_html
    );

    APEX_MAIL.PUSH_QUEUE;
  END send_submission_received_email;

  ----------------------------------------------------------------------------

  PROCEDURE send_otp_email(
    p_email      IN VARCHAR2,
    p_full_name  IN VARCHAR2,
    p_otp_code   IN VARCHAR2
  ) IS
    l_workspace_id NUMBER;
    l_from_email   VARCHAR2(128);
    l_body         CLOB;
    l_html         CLOB;
    l_content      CLOB;
    l_mail_id      NUMBER;
  BEGIN
    l_content :=
    '<p class="body-p" style="margin:0 0 18px;font-size:15px;color:#222222;line-height:1.7;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Hello <strong>' || p_full_name || '</strong>,
    </p>
    <p class="body-p" style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Thank you for registering with <strong><span style="color:#cc0000;">G</span>CODE</strong>. Use the verification code
      below to complete your registration.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px;background:#0d0d0d;border-radius:10px;">
    <tr>
    <td style="padding:32px;text-align:center;">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999999;font-family:Arial,sans-serif;">Your Verification Code</p>
      <span style="display:inline-block;font-size:34px;font-weight:800;letter-spacing:8px;color:#ffffff;background:#cc0000;padding:16px 32px;border-radius:8px;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
        ' || p_otp_code || '
      </span>
    </td>
    </tr>
    </table>

    <p class="body-p" style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      This verification code will expire in <strong>15 minutes</strong>.
    </p>
    <p class="body-p" style="margin:0 0 32px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      If you did not request this verification, you can safely ignore this email.
    </p>';

    l_html := wrap_layout(
      p_page_title => 'GCODE Verification',
      p_ref_line   => 'Reference: Account Verification',
      p_heading    => 'Verify Your Email<br/><span style="color:#cc0000;">One-Time Passcode</span>',
      p_content    => l_content
    );

    SELECT workspace_id
      INTO l_workspace_id
      FROM apex_applications
     WHERE alias = 'GCODE'
     FETCH FIRST 1 ROWS ONLY;

    APEX_UTIL.SET_SECURITY_GROUP_ID(l_workspace_id);
    l_from_email := 'no-reply@gcode.in';

    l_body := 'Your GCODE verification code is: ' || p_otp_code || '. Valid for 15 minutes.';

    l_mail_id := APEX_MAIL.SEND(
      p_to        => p_email,
      p_from      => l_from_email,
      p_subj      => 'Verify your GCODE Account',
      p_body      => l_body,
      p_body_html => l_html
    );

    APEX_MAIL.PUSH_QUEUE;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE_APPLICATION_ERROR(-20001, 'Mail sending failed: ' || SQLERRM);
  END send_otp_email;

  ----------------------------------------------------------------------------

  PROCEDURE send_reset_email(
    p_email      IN VARCHAR2,
    p_full_name  IN VARCHAR2,
    p_reset_link IN VARCHAR2
  ) IS
    l_workspace_id NUMBER;
    l_from_email   VARCHAR2(128);
    l_body         CLOB;
    l_html         CLOB;
    l_content      CLOB;
    l_mail_id      NUMBER;
  BEGIN
    l_content :=
    '<p class="body-p" style="margin:0 0 18px;font-size:15px;color:#222222;line-height:1.7;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Hello <strong>' || p_full_name || '</strong>,
    </p>
    <p class="body-p" style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      We received a request to reset the password for your <strong><span style="color:#cc0000;">G</span>CODE</strong> account.
      Click the button below to choose a new password.
    </p>

    <div style="text-align:center;margin:0 0 28px;">
    <a href="' || p_reset_link || '" style="display:inline-block;background:#cc0000;color:#ffffff;padding:16px 36px;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Reset Password
    </a>
    </div>

    <p class="body-p" style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      This link will expire in <strong>30 minutes</strong> and can only be used once.
    </p>
    <p class="body-p" style="margin:0 0 32px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      If you did not request this, you can safely ignore this email &mdash; your password will not be changed.
    </p>';

    l_html := wrap_layout(
      p_page_title => 'GCODE Password Reset',
      p_ref_line   => 'Reference: Password Reset Request',
      p_heading    => 'Reset Your Password<br/><span style="color:#cc0000;">Secure Account Access</span>',
      p_content    => l_content
    );

    SELECT workspace_id
      INTO l_workspace_id
      FROM apex_applications
     WHERE alias = 'GCODE'
     FETCH FIRST 1 ROWS ONLY;

    APEX_UTIL.SET_SECURITY_GROUP_ID(l_workspace_id);
    l_from_email := 'no-reply@gcode.in';

    l_body := 'Reset your GCODE password: ' || p_reset_link || '. Valid for 30 minutes.';

    l_mail_id := APEX_MAIL.SEND(
      p_to        => p_email,
      p_from      => l_from_email,
      p_subj      => 'Reset your GCODE password',
      p_body      => l_body,
      p_body_html => l_html
    );

    APEX_MAIL.PUSH_QUEUE;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE_APPLICATION_ERROR(-20001, 'Reset email sending failed: ' || SQLERRM);
  END send_reset_email;

  ----------------------------------------------------------------------------

  PROCEDURE send_rating_invite_email(
    p_email       IN VARCHAR2,
    p_full_name   IN VARCHAR2,
    p_event_id    IN NUMBER,
    p_attendee_id IN NUMBER
  ) IS
    l_workspace_id NUMBER;
    l_from_email   VARCHAR2(128);
    l_body         CLOB;
    l_html         CLOB;
    l_content      CLOB;
    l_mail_id      NUMBER;
    v_title        events.title%TYPE;
    v_rate_url     VARCHAR2(500);
  BEGIN
    SELECT title INTO v_title FROM events WHERE id = p_event_id;

    v_rate_url := 'https://events.gcode.in/events/' || p_event_id
                  || '/rate?aid=' || p_attendee_id;

    l_content :=
    '<p class="body-p" style="margin:0 0 18px;font-size:15px;color:#222222;line-height:1.7;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Dear <strong>' || NVL(p_full_name, 'there') || '</strong>,
    </p>
    <p class="body-p" style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      <strong style="color:#111111;">' || v_title || '</strong> is live! Use the link below to rate each
      performance as it happens &mdash; this link is uniquely yours, so keep it private.
    </p>

    <div style="text-align:center;margin:0 0 28px;">
    <a href="' || v_rate_url || '" style="display:inline-block;background:#cc0000;color:#ffffff;padding:14px 32px;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Open Live Rating
    </a>
    </div>

    <p class="body-p" style="margin:0 0 32px;font-size:15px;color:#444444;line-height:1.85;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
      Keep this page open during the event &mdash; it updates live as the organizer moves through each performance.
    </p>';

    l_html := wrap_layout(
      p_page_title => 'GCODE Live Rating',
      p_ref_line   => 'Reference: ' || v_title,
      p_heading    => 'Rate The Performances<br/><span style="color:#cc0000;">Live, As They Happen</span>',
      p_content    => l_content
    );

    SELECT workspace_id
      INTO l_workspace_id
      FROM apex_applications
     WHERE alias = 'GCODE'
     FETCH FIRST 1 ROWS ONLY;

    APEX_UTIL.SET_SECURITY_GROUP_ID(l_workspace_id);
    l_from_email := 'no-reply@gcode.in';

    l_body := 'Rate live performances for ' || v_title || ': ' || v_rate_url;

    l_mail_id := APEX_MAIL.SEND(
      p_to        => p_email,
      p_from      => l_from_email,
      p_subj      => 'Rate the performances live — ' || v_title,
      p_body      => l_body,
      p_body_html => l_html
    );

    APEX_MAIL.PUSH_QUEUE;
  END send_rating_invite_email;

END GCODE_EMAIL_API;
/
```

</details>

## GCODE_WHATSAPP_API

Outbound WhatsApp, via Meta's Cloud API. Mirrors `GCODE_EMAIL_API`'s shape — one `send_*` procedure per message type — but the transport is `APEX_WEB_SERVICE.MAKE_REST_REQUEST` (same pattern `GCODE_PAYMENTS_API` uses for Razorpay) POSTing to `graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages`, not `APEX_MAIL`. `get_secret` pulls `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` from `GCODE_APP_SECRETS`, the same secrets table Razorpay's credentials live in.

Every send is a WhatsApp **template message** — free-form business-initiated text isn't allowed outside a live 24h customer-service session, so every message type needs its own template pre-approved in Meta Business Manager before it can send: `phone_verification_otp` (Authentication category), `event_ticket` / `submission_received` / `event_update` (Utility category).

The JSON request body is built with `APEX_JSON` (`open_object`/`write`/`open_array`/`close_*`, then `get_clob_output`) rather than the `JSON_OBJECT`/`JSON_ARRAY` SQL functions `GCODE_PAYMENTS_API` uses elsewhere — a deliberate choice for this package, not an inconsistency to fix; nested conditional structure (optional header, optional button, a variable-length body-params loop) is more readable built imperatively than as one large nested `JSON_OBJECT(...)` expression.

| Procedure | Purpose |
| --- | --- |
| `get_secret` | Internal — reads `GCODE_APP_SECRETS` by name, identical pattern to `GCODE_PAYMENTS_API.get_secret` |
| `build_body_params` | Internal — `APEX_T_VARCHAR2` → the `[{"type":"text","text":...}, ...]` array every template body needs |
| `send_template` | Internal — generic Utility-template sender: optional image header (`p_header_image_url`, fetched by Meta from a public link — no pre-upload needed), body params, optional single URL-button param. `send_ticket_confirmation`/`send_submission_received`/`send_event_update` all funnel through this |
| `send_otp` | Public, standalone — Authentication-category templates have a Meta-fixed layout (code + expiry footer + copy-code button, no header, no free body text) different enough from the Utility shape that it doesn't share `send_template` |
| `send_ticket_confirmation` | QR sent as the header image — reuses the same `api.qrserver.com` link `GCODE_EMAIL_API.send_confirmation_email` already builds, so no new QR-generation logic; body mirrors the email's order-summary card; one URL button to the ticket page |
| `send_submission_received` | Body-only, no header/button |
| `send_event_update` | Body-only — for the organizer-broadcast feature, still deferred on the frontend/ORDS side |

**Not yet wired to any caller as of this snapshot** — `create_participant`/`submit_audio` still only call `GCODE_EMAIL_API`. See the plan file for the exact diff that adds the `GCODE_WHATSAPP_API.send_ticket_confirmation`/`send_submission_received` calls alongside (not instead of) the existing email sends, gated on `gcode_users.is_phone_verified`.

<details>
<summary>Full source</summary>

## GCODE_WHATSAPP_API

```sql
create or replace package body "GCODE_WHATSAPP_API" as


   ------------------------------------------------------------------------------
  -- Returns a secret from GCODE_APP_SECRETS
  ------------------------------------------------------------------------------
  FUNCTION get_secret(
    p_name VARCHAR2
  ) RETURN VARCHAR2 IS
    v_val GCODE_APP_SECRETS.secret_value%TYPE;
  BEGIN
    SELECT secret_value
      INTO v_val
      FROM GCODE_APP_SECRETS
     WHERE secret_name = p_name;

    RETURN v_val;
  END get_secret;


  ------------------------------------------------------------------------------
  -- Builds the body parameter array for WhatsApp templates
  ------------------------------------------------------------------------------
  FUNCTION build_body_params(
      p_values IN APEX_T_VARCHAR2
  ) RETURN CLOB IS

      v_json CLOB;

  BEGIN

      IF p_values IS NULL OR p_values.COUNT = 0 THEN
          RETURN '[]';
      END IF;

      SELECT JSON_ARRAYAGG(
                 JSON_OBJECT(
                     'type' VALUE 'text',
                     'text' VALUE COLUMN_VALUE
                 )
                 RETURNING CLOB
             )
      INTO v_json
      FROM TABLE(p_values);

      RETURN v_json;

  END build_body_params;

------------------------------------------------------------------------------
-- Generic Utility Template Sender
------------------------------------------------------------------------------
PROCEDURE send_template(
    p_phone             IN VARCHAR2,
    p_template_name     IN VARCHAR2,
    p_body_values       IN APEX_T_VARCHAR2,
    p_header_image_url  IN VARCHAR2 DEFAULT NULL,
    p_button_url_param  IN VARCHAR2 DEFAULT NULL
) IS
    v_url      VARCHAR2(500);
    v_req_body CLOB;
    v_resp     CLOB;
BEGIN
    IF p_phone IS NULL THEN
        RETURN;
    END IF;

    --------------------------------------------------------------------------
    -- Build JSON Request
    --------------------------------------------------------------------------
    APEX_JSON.initialize_clob_output;

    APEX_JSON.open_object;

    APEX_JSON.write('messaging_product', 'whatsapp');
    APEX_JSON.write('to', p_phone);
    APEX_JSON.write('type', 'template');

    --------------------------------------------------------------------------
    -- Template
    --------------------------------------------------------------------------
    APEX_JSON.open_object('template');

    APEX_JSON.write('name', p_template_name);

    APEX_JSON.open_object('language');
    APEX_JSON.write('code', 'en');
    APEX_JSON.close_object;

    --------------------------------------------------------------------------
    -- Components
    --------------------------------------------------------------------------
    APEX_JSON.open_array('components');

    --------------------------------------------------------------------------
    -- Optional Header
    --------------------------------------------------------------------------
    IF p_header_image_url IS NOT NULL THEN

        APEX_JSON.open_object;
        APEX_JSON.write('type', 'header');

        APEX_JSON.open_array('parameters');

            APEX_JSON.open_object;
            APEX_JSON.write('type', 'image');

            APEX_JSON.open_object('image');
            APEX_JSON.write('link', p_header_image_url);
            APEX_JSON.close_object;

            APEX_JSON.close_object;

        APEX_JSON.close_array;

        APEX_JSON.close_object;

    END IF;

    --------------------------------------------------------------------------
    -- Body
    --------------------------------------------------------------------------
    APEX_JSON.open_object;
    APEX_JSON.write('type', 'body');

    APEX_JSON.open_array('parameters');

    IF p_body_values IS NOT NULL THEN
        FOR i IN 1 .. p_body_values.COUNT LOOP
            APEX_JSON.open_object;
            APEX_JSON.write('type', 'text');
            APEX_JSON.write('text', p_body_values(i));
            APEX_JSON.close_object;
        END LOOP;
    END IF;

    APEX_JSON.close_array;

    APEX_JSON.close_object;

    --------------------------------------------------------------------------
    -- Optional URL Button
    --------------------------------------------------------------------------
    IF p_button_url_param IS NOT NULL THEN

        APEX_JSON.open_object;

        APEX_JSON.write('type', 'button');
        APEX_JSON.write('sub_type', 'url');
        APEX_JSON.write('index', '0');

        APEX_JSON.open_array('parameters');

            APEX_JSON.open_object;
            APEX_JSON.write('type', 'text');
            APEX_JSON.write('text', p_button_url_param);
            APEX_JSON.close_object;

        APEX_JSON.close_array;

        APEX_JSON.close_object;

    END IF;

    APEX_JSON.close_array;   -- components
    APEX_JSON.close_object;  -- template
    APEX_JSON.close_object;  -- root

    v_req_body := APEX_JSON.get_clob_output;
    APEX_JSON.free_output;

    --------------------------------------------------------------------------
    -- Endpoint
    --------------------------------------------------------------------------
    v_url :=
        'https://graph.facebook.com/v20.0/' ||
        get_secret('WHATSAPP_PHONE_NUMBER_ID') ||
        '/messages';

    --------------------------------------------------------------------------
    -- Headers
    --------------------------------------------------------------------------
    APEX_WEB_SERVICE.g_request_headers.DELETE;

    APEX_WEB_SERVICE.g_request_headers(1).name  := 'Authorization';
    APEX_WEB_SERVICE.g_request_headers(1).value := 'Bearer ' || get_secret('WHATSAPP_ACCESS_TOKEN');

    APEX_WEB_SERVICE.g_request_headers(2).name  := 'Content-Type';
    APEX_WEB_SERVICE.g_request_headers(2).value := 'application/json';

    --------------------------------------------------------------------------
    -- Send
    --------------------------------------------------------------------------
    v_resp := APEX_WEB_SERVICE.make_rest_request(
        p_url         => v_url,
        p_http_method => 'POST',
        p_body        => v_req_body
    );

    IF APEX_WEB_SERVICE.g_status_code NOT IN (200, 201) THEN
        RAISE_APPLICATION_ERROR(
            -20010,
            'WhatsApp send failed: ' || v_resp
        );
    END IF;

END send_template;

  -- OTP messages must use an "Authentication"-category Meta template, not
  -- "Utility" — Meta enforces a fixed layout for these (code + expiry
  -- footer + one-tap/copy-code button), no free body text or header.
    PROCEDURE send_otp(
    p_phone    IN VARCHAR2,
    p_otp_code IN VARCHAR2
  ) IS
    v_url      VARCHAR2(500);
    v_req_body CLOB;
    v_resp     CLOB;
  BEGIN
    IF p_phone IS NULL THEN
      RETURN;
    END IF;

    v_req_body := JSON_OBJECT(
      'messaging_product' VALUE 'whatsapp',
      'to'                VALUE p_phone,
      'type'              VALUE 'template',
      'template' VALUE JSON_OBJECT(
        'name'     VALUE 'phone_verification_otp', -- exact name of the approved Authentication template
        'language' VALUE JSON_OBJECT('code' VALUE 'en'),
        'components' VALUE JSON_ARRAY(
          JSON_OBJECT(
            'type' VALUE 'body',
            'parameters' VALUE JSON_ARRAY(JSON_OBJECT('type' VALUE 'text', 'text' VALUE p_otp_code))
          ),
          JSON_OBJECT(
            'type' VALUE 'button', 'sub_type' VALUE 'url', 'index' VALUE '0',
            'parameters' VALUE JSON_ARRAY(JSON_OBJECT('type' VALUE 'text', 'text' VALUE p_otp_code))
          )
        )
      )
    );

    v_url := 'https://graph.facebook.com/v20.0/' || get_secret('WHATSAPP_PHONE_NUMBER_ID') || '/messages';

    APEX_WEB_SERVICE.g_request_headers.DELETE;
    APEX_WEB_SERVICE.g_request_headers(1).name  := 'Authorization';
    APEX_WEB_SERVICE.g_request_headers(1).value := 'Bearer ' || get_secret('WHATSAPP_ACCESS_TOKEN');
    APEX_WEB_SERVICE.g_request_headers(2).name  := 'Content-Type';
    APEX_WEB_SERVICE.g_request_headers(2).value := 'application/json';

    v_resp := APEX_WEB_SERVICE.MAKE_REST_REQUEST(
      p_url => v_url, p_http_method => 'POST', p_body => v_req_body
    );

    IF APEX_WEB_SERVICE.g_status_code NOT IN (200, 201) THEN
      RAISE_APPLICATION_ERROR(-20010, 'WhatsApp OTP send failed: ' || v_resp);
    END IF;
  END send_otp;

  PROCEDURE send_ticket_confirmation(
    p_phone       IN VARCHAR2,
    p_full_name   IN VARCHAR2,
    p_event_title IN VARCHAR2,
    p_when_date   IN VARCHAR2,
    p_booking_ref IN VARCHAR2,
    p_qr_url      IN VARCHAR2,
    p_ticket_url  IN VARCHAR2
  ) IS
  BEGIN
    send_template(
      p_phone            => p_phone,
      p_template_name    => 'event_ticket',
      p_body_values      => APEX_T_VARCHAR2(p_full_name, p_event_title, p_when_date, p_booking_ref),
      p_header_image_url => p_qr_url,
      p_button_url_param => p_booking_ref -- matches whatever dynamic URL suffix the button template uses
    );
  END send_ticket_confirmation;

  PROCEDURE send_submission_received(
    p_phone       IN VARCHAR2,
    p_full_name   IN VARCHAR2,
    p_event_title IN VARCHAR2
  ) IS
  BEGIN
    send_template(
      p_phone         => p_phone,
      p_template_name => 'submission_received',
      p_body_values   => APEX_T_VARCHAR2(p_full_name, p_event_title)
    );
  END send_submission_received;

  PROCEDURE send_event_update(
    p_phone     IN VARCHAR2,
    p_full_name IN VARCHAR2,
    p_message   IN VARCHAR2
  ) IS
  BEGIN
    send_template(
      p_phone         => p_phone,
      p_template_name => 'event_update',
      p_body_values   => APEX_T_VARCHAR2(p_full_name, p_message)
    );
  END send_event_update;

end "GCODE_WHATSAPP_API";
/
```

</details>

## gcode_events_api

Event CRUD behind `/events`. `create_event`/`update_event` take a large flat parameter list mirroring the `events` table 1:1 (every `DEFAULT NULL` in `update_event` means "leave column unchanged" via `NVL(p_x, x)` — a common ORDS-PL/SQL pattern for partial updates). `get_event` is the one interesting read: it joins lookups (`event_types`, `mode_of_events`, `event_status`, `gcode_users` for organizer name/email) and computes `registered_count`/`participant_registered_count` as correlated-subquery sums over `gcode_event_participants` rather than a denormalized counter column — matches the "derive, don't denormalize" decision already recorded in `backend-integration-strategy.md` §1.2.

| Procedure | Purpose |
| --- | --- |
| `default_status_id` | Internal — resolves the `DRAFT` status id for new events |
| `create_event` / `update_event` / `delete_event` | Standard CRUD; `update_event` is fully NVL-partial (any omitted param leaves the column as-is) |
| `get_event` | Single-event read with joined lookups + live registration counts |
| `replace_timeline` / `replace_social_links` / `replace_media` | Bulk replace-all from a JSON array body via `JSON_TABLE` — matches the wizard editing the whole list at once, not per-item CRUD |
| `assign_category` / `remove_category` | Event↔category join-table maintenance (`MERGE`/`DELETE`) |
| `set_cover_image` / `set_banner_image` | Single-column image URL updates |

No relevance to the WhatsApp/notification-preference work — included here for completeness since it's part of the same schema `gcode_users`/`events` the other packages join against.

<details>
<summary>Full source</summary>

## gcode_events_api

```sql
create or replace PACKAGE BODY gcode_events_api AS

  FUNCTION default_status_id RETURN events.status_id%TYPE IS
    v_id event_status.id%TYPE;
  BEGIN
    SELECT id INTO v_id FROM event_status WHERE status_code = 'DRAFT';
    RETURN v_id;
  EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL;
  END default_status_id;

  PROCEDURE create_event (
    p_title                       IN  events.title%TYPE,
    p_event_type_id               IN  events.event_type_id%TYPE,
    p_mode_of_event_id            IN  events.mode_of_event_id%TYPE,
    p_status_id                   IN  events.status_id%TYPE            DEFAULT NULL,
    p_summary                     IN  events.summary%TYPE              DEFAULT NULL,
    p_description                 IN  events.description%TYPE          DEFAULT NULL,
    p_start_date                  IN  events.start_date%TYPE           DEFAULT NULL,
    p_end_date                    IN  events.end_date%TYPE             DEFAULT NULL,
    p_registration_start          IN  events.registration_start%TYPE   DEFAULT NULL,
    p_registration_deadline       IN  events.registration_deadline%TYPE DEFAULT NULL,
    p_city                        IN  events.city%TYPE                 DEFAULT NULL,
    p_venue_address               IN  events.venue_address%TYPE        DEFAULT NULL,
    p_participation_link          IN  events.participation_link%TYPE   DEFAULT NULL,
    p_max_attendees               IN  events.max_attendees%TYPE        DEFAULT NULL,
    p_ticket_price                IN  events.ticket_price%TYPE         DEFAULT 0,
    p_is_featured                 IN  events.is_featured%TYPE          DEFAULT 0,
    p_certificate_offered         IN  events.certificate_offered%TYPE  DEFAULT 0,
    p_cover_image_url             IN  events.cover_image_url%TYPE      DEFAULT NULL,
    p_banner_image_url            IN  events.banner_image_url%TYPE     DEFAULT NULL,
    p_is_external                 IN  events.is_external%TYPE          DEFAULT 0,
    p_external_url                IN  events.external_url%TYPE         DEFAULT NULL,
    p_created_by                  IN  events.created_by%TYPE           DEFAULT NULL,
    p_organizer_id                IN  events.organizer_id%TYPE         DEFAULT NULL,
    p_max_tickets_per_registration IN events.max_tickets_per_registration%TYPE DEFAULT NULL,
    p_terms                      IN  events.terms%TYPE                DEFAULT NULL,
    p_eligibility                IN  events.eligibility%TYPE          DEFAULT NULL,
    p_duration_text               IN  events.duration_text%TYPE        DEFAULT NULL,
    p_attendee_label                   IN events.attendee_label%TYPE                   DEFAULT NULL,
    p_attendee_description             IN events.attendee_description%TYPE             DEFAULT NULL,
    p_attendee_registration_enabled    IN events.attendee_registration_enabled%TYPE    DEFAULT 1,
    p_participant_registration_enabled IN events.participant_registration_enabled%TYPE DEFAULT 0,
    p_participant_label                IN events.participant_label%TYPE                DEFAULT NULL,
    p_participant_description          IN events.participant_description%TYPE          DEFAULT NULL,
    p_participant_price                IN events.participant_price%TYPE                DEFAULT NULL,
    p_participant_capacity             IN events.participant_capacity%TYPE             DEFAULT NULL,
    p_participant_max_tickets_per_registration IN events.participant_max_tickets_per_registration%TYPE DEFAULT NULL,
    p_participant_registration_start    IN events.participant_registration_start%TYPE DEFAULT NULL,
    p_participant_registration_deadline IN events.participant_registration_deadline%TYPE DEFAULT NULL,
    p_id                          OUT events.id%TYPE
  ) IS
    v_status_id events.status_id%TYPE;
  BEGIN
    v_status_id := NVL(p_status_id, default_status_id());

    INSERT INTO events (
      title, event_type_id, mode_of_event_id, status_id, summary, description,
      start_date, end_date, registration_start, registration_deadline, city, venue_address,
      participation_link, max_attendees, ticket_price, is_featured,
      certificate_offered, cover_image_url, banner_image_url, is_external,
      external_url, created_by, organizer_id, max_tickets_per_registration,
      terms, eligibility, duration_text, created_on,
      attendee_label, attendee_description, attendee_registration_enabled,
      participant_registration_enabled,
      participant_label, participant_description, participant_price, participant_capacity,
      participant_max_tickets_per_registration, participant_registration_start,
      participant_registration_deadline
    ) VALUES (
      p_title, p_event_type_id, p_mode_of_event_id,
      v_status_id, p_summary, p_description,
      p_start_date, p_end_date, p_registration_start, p_registration_deadline, p_city, p_venue_address,
      p_participation_link, p_max_attendees, NVL(p_ticket_price,0),
      NVL(p_is_featured,0), NVL(p_certificate_offered,0), p_cover_image_url,
      p_banner_image_url, NVL(p_is_external,0), p_external_url, p_created_by,
      p_organizer_id, p_max_tickets_per_registration, p_terms, p_eligibility,
      p_duration_text, SYSTIMESTAMP,
      p_attendee_label, p_attendee_description, NVL(p_attendee_registration_enabled,1),
      NVL(p_participant_registration_enabled,0),
      p_participant_label, p_participant_description, p_participant_price, p_participant_capacity,
      p_participant_max_tickets_per_registration, p_participant_registration_start,
      p_participant_registration_deadline
    ) RETURNING id INTO p_id;
  END create_event;


    PROCEDURE update_event (
        p_id                          IN  events.id%TYPE,
        p_title                       IN  events.title%TYPE                DEFAULT NULL,
        p_event_type_id               IN  events.event_type_id%TYPE        DEFAULT NULL,
        p_mode_of_event_id            IN  events.mode_of_event_id%TYPE     DEFAULT NULL,
        p_status_id                   IN  events.status_id%TYPE            DEFAULT NULL,
        p_summary                     IN  events.summary%TYPE              DEFAULT NULL,
        p_description                 IN  events.description%TYPE          DEFAULT NULL,
        p_start_date                  IN  events.start_date%TYPE           DEFAULT NULL,
        p_end_date                    IN  events.end_date%TYPE             DEFAULT NULL,
        p_registration_start          IN  events.registration_start%TYPE   DEFAULT NULL,
        p_registration_deadline       IN  events.registration_deadline%TYPE DEFAULT NULL,
        p_city                        IN  events.city%TYPE                 DEFAULT NULL,
        p_venue_address               IN  events.venue_address%TYPE        DEFAULT NULL,
        p_participation_link          IN  events.participation_link%TYPE   DEFAULT NULL,
        p_max_attendees               IN  events.max_attendees%TYPE        DEFAULT NULL,
        p_ticket_price                IN  events.ticket_price%TYPE         DEFAULT NULL,
        p_is_featured                 IN  events.is_featured%TYPE          DEFAULT NULL,
        p_certificate_offered         IN  events.certificate_offered%TYPE  DEFAULT NULL,
        p_cover_image_url             IN  events.cover_image_url%TYPE      DEFAULT NULL,
        p_banner_image_url            IN  events.banner_image_url%TYPE     DEFAULT NULL,
        p_is_external                 IN  events.is_external%TYPE          DEFAULT NULL,
        p_external_url                IN  events.external_url%TYPE         DEFAULT NULL,
        p_updated_by                  IN  events.updated_by%TYPE           DEFAULT NULL,
        p_organizer_id                IN  events.organizer_id%TYPE         DEFAULT NULL,
        p_max_tickets_per_registration IN events.max_tickets_per_registration%TYPE DEFAULT NULL,
        p_terms                      IN  events.terms%TYPE                DEFAULT NULL,
        p_eligibility                IN  events.eligibility%TYPE          DEFAULT NULL,
        p_duration_text               IN  events.duration_text%TYPE        DEFAULT NULL,
        p_attendee_label                   IN events.attendee_label%TYPE                   DEFAULT NULL,
        p_attendee_description             IN events.attendee_description%TYPE             DEFAULT NULL,
        p_attendee_registration_enabled    IN events.attendee_registration_enabled%TYPE    DEFAULT NULL,
        p_participant_registration_enabled IN events.participant_registration_enabled%TYPE DEFAULT NULL,
        p_participant_label                IN events.participant_label%TYPE                DEFAULT NULL,
        p_participant_description          IN events.participant_description%TYPE          DEFAULT NULL,
        p_participant_price                IN events.participant_price%TYPE                DEFAULT NULL,
        p_participant_capacity             IN events.participant_capacity%TYPE             DEFAULT NULL,
        p_participant_max_tickets_per_registration IN events.participant_max_tickets_per_registration%TYPE DEFAULT NULL,
        p_participant_registration_start    IN events.participant_registration_start%TYPE DEFAULT NULL,
        p_participant_registration_deadline IN events.participant_registration_deadline%TYPE DEFAULT NULL,
        p_rating_mode                       IN events.rating_mode%TYPE DEFAULT NULL
  ) IS
  BEGIN
    UPDATE events SET
      title                        = NVL(p_title, title),
      event_type_id                = NVL(p_event_type_id, event_type_id),
      mode_of_event_id             = NVL(p_mode_of_event_id, mode_of_event_id),
      status_id                    = NVL(p_status_id, status_id),
      summary                      = NVL(p_summary, summary),
      description                  = NVL(p_description, description),
      start_date                   = NVL(p_start_date, start_date),
      end_date                     = NVL(p_end_date, end_date),
      registration_start           = NVL(p_registration_start, registration_start),
      registration_deadline        = NVL(p_registration_deadline, registration_deadline),
      city                         = NVL(p_city, city),
      venue_address                = NVL(p_venue_address, venue_address),
      participation_link           = NVL(p_participation_link, participation_link),
      max_attendees                = NVL(p_max_attendees, max_attendees),
      ticket_price                 = NVL(p_ticket_price, ticket_price),
      is_featured                  = NVL(p_is_featured, is_featured),
      certificate_offered          = NVL(p_certificate_offered, certificate_offered),
      cover_image_url              = NVL(p_cover_image_url, cover_image_url),
      banner_image_url             = NVL(p_banner_image_url, banner_image_url),
      is_external                  = NVL(p_is_external, is_external),
      external_url                 = NVL(p_external_url, external_url),
      organizer_id                 = NVL(p_organizer_id, organizer_id),
      max_tickets_per_registration = NVL(p_max_tickets_per_registration, max_tickets_per_registration),
      terms                        = NVL(p_terms, terms),
      eligibility                  = NVL(p_eligibility, eligibility),
      duration_text                = NVL(p_duration_text, duration_text),
      attendee_label                     = NVL(p_attendee_label, attendee_label),
      attendee_description               = NVL(p_attendee_description, attendee_description),
      attendee_registration_enabled      = NVL(p_attendee_registration_enabled, attendee_registration_enabled),
      participant_registration_enabled   = NVL(p_participant_registration_enabled, participant_registration_enabled),
      participant_label                  = NVL(p_participant_label, participant_label),
      participant_description            = NVL(p_participant_description, participant_description),
      participant_price                  = NVL(p_participant_price, participant_price),
      participant_capacity               = NVL(p_participant_capacity, participant_capacity),
      participant_max_tickets_per_registration = NVL(p_participant_max_tickets_per_registration, participant_max_tickets_per_registration),
      participant_registration_start     = NVL(p_participant_registration_start, participant_registration_start),
      participant_registration_deadline  = NVL(p_participant_registration_deadline, participant_registration_deadline),
      rating_mode                  = NVL(p_rating_mode, rating_mode),
      updated_by                   = p_updated_by,
      updated_on                   = SYSTIMESTAMP
    WHERE id = p_id;
  END update_event;


  PROCEDURE delete_event (p_id IN events.id%TYPE) IS
      BEGIN
        DELETE FROM events WHERE id = p_id;
  END delete_event;

  PROCEDURE get_event (p_id IN events.id%TYPE, p_result OUT SYS_REFCURSOR) IS
BEGIN
  OPEN p_result FOR
    SELECT e.id                            AS "id",
           e.title                         AS "event_name",
           e.event_type_id                 AS "event_type_id",
           e.mode_of_event_id              AS "mode_of_event_id",
           e.status_id                     AS "status_id",
           e.summary                       AS "summary",
           e.description                   AS "description",
           e.start_date                    AS "start_date",
           e.end_date                      AS "end_date",
           e.registration_start            AS "registration_start",
           e.registration_deadline         AS "registration_deadline",
           e.city                          AS "city",
           e.venue_address                 AS "address",
           e.participation_link            AS "participation_link",
           e.max_attendees                 AS "max_attendees",
           e.ticket_price                  AS "ticket_price",
           e.is_featured                   AS "is_featured",
           e.certificate_offered           AS "certificate_offered",
           e.cover_image_url               AS "cover_image_url",
           e.banner_image_url              AS "banner_image_url",
           e.is_external                   AS "is_external",
           e.external_url                  AS "external_url",
           e.created_by                    AS "created_by",
           e.created_on                    AS "created_on",
           e.updated_by                    AS "updated_by",
           e.updated_on                    AS "updated_on",
          TO_CHAR(e.organizer_id)                AS "organizer_id",
           e.max_tickets_per_registration  AS "max_tickets_per_registration",
           e.duration_text                 AS "duration_text",
           e.rating_mode                   AS "rating_mode",
           e.terms                         AS "terms",
           e.eligibility                   AS "eligibility",
           e.attendee_label                    AS "attendee_label",
           e.attendee_description              AS "attendee_description",
           e.attendee_registration_enabled     AS "attendee_registration_enabled",
           e.participant_registration_enabled  AS "participant_registration_enabled",
           e.participant_label                 AS "participant_label",
           e.participant_description           AS "participant_description",
           e.participant_price                 AS "participant_price",
           e.participant_capacity              AS "participant_capacity",
           e.participant_max_tickets_per_registration AS "participant_max_tickets_per_registration",
           e.participant_registration_start    AS "participant_registration_start",
           e.participant_registration_deadline AS "participant_registration_deadline",
           (SELECT NVL(SUM(gep.quantity),0) FROM gcode_event_participants gep
            WHERE gep.event_id = e.id AND gep.active = 'Y'
              AND gep.category = 'PARTICIPANT') AS "participant_registered_count",
           gu.full_name                    AS "organizer_name",
           gu.email                        AS "organizer_email",
           et.name                         AS "type_name",
           m.mode_name                     AS "mode_name",
           s.status_code                   AS "status_code",
           (SELECT NVL(SUM(gep.quantity),0) FROM gcode_event_participants gep
            WHERE gep.event_id = e.id AND gep.active = 'Y'
              AND gep.category = 'ATTENDEE') AS "registered_count",
           (SELECT JSON_ARRAYAGG(ecm.category_id)
            FROM event_category_map ecm WHERE ecm.event_id = e.id) AS "category_ids",
           (SELECT JSON_ARRAYAGG(ec.category_name)
            FROM event_category_map ecm
            JOIN event_categories ec ON ec.id = ecm.category_id
            WHERE ecm.event_id = e.id) AS "category_names"
    FROM events e
    JOIN event_types    et ON et.id = e.event_type_id
    JOIN mode_of_events m  ON m.id  = e.mode_of_event_id
    JOIN event_status   s  ON s.id  = e.status_id
    LEFT JOIN gcode_users gu ON gu.user_id = e.organizer_id
    WHERE e.id = p_id;
END get_event;


  PROCEDURE replace_timeline (p_event_id IN events.id%TYPE, p_items IN CLOB) IS
  BEGIN
    DELETE FROM event_timeline WHERE event_id = p_event_id;
    INSERT INTO event_timeline (event_id, title, description, start_time, end_time, location, sort_order)
    SELECT p_event_id, j.title, j.description, j.start_time, j.end_time, j.location, j.sort_order
    FROM JSON_TABLE(p_items, '$[*]' COLUMNS (
      title       VARCHAR2(200)            PATH '$.title',
      description VARCHAR2(1000)           PATH '$.description',
      start_time  TIMESTAMP WITH TIME ZONE PATH '$.startTime',
      end_time    TIMESTAMP WITH TIME ZONE PATH '$.endTime',
      location    VARCHAR2(400)            PATH '$.location',
      sort_order  NUMBER                   PATH '$.sortOrder'
    )) j;
  END replace_timeline;

  PROCEDURE replace_social_links (p_event_id IN events.id%TYPE, p_items IN CLOB) IS
  BEGIN
    DELETE FROM event_social_links WHERE event_id = p_event_id;
    INSERT INTO event_social_links (event_id, platform, url)
    SELECT p_event_id, j.platform, j.url
    FROM JSON_TABLE(p_items, '$[*]' COLUMNS (
      platform VARCHAR2(60)   PATH '$.platform',
      url      VARCHAR2(1000) PATH '$.url'
    )) j;
  END replace_social_links;

  PROCEDURE replace_media (p_event_id IN events.id%TYPE, p_items IN CLOB) IS
  BEGIN
    DELETE FROM event_media WHERE event_id = p_event_id;
    INSERT INTO event_media (event_id, url, sort_order)
    SELECT p_event_id, j.url, j.sort_order
    FROM JSON_TABLE(p_items, '$[*]' COLUMNS (
      url        VARCHAR2(1000) PATH '$.url',
      sort_order NUMBER         PATH '$.sortOrder'
    )) j;
  END replace_media;

  PROCEDURE assign_category (p_event_id IN events.id%TYPE, p_category_id IN event_categories.id%TYPE) IS
  BEGIN
    MERGE INTO event_category_map t
    USING (SELECT p_event_id AS eid, p_category_id AS cid FROM dual) s
    ON (t.event_id = s.eid AND t.category_id = s.cid)
    WHEN NOT MATCHED THEN INSERT (event_id, category_id) VALUES (s.eid, s.cid);
  END assign_category;

  PROCEDURE remove_category (p_event_id IN events.id%TYPE, p_category_id IN event_categories.id%TYPE) IS
  BEGIN
    DELETE FROM event_category_map WHERE event_id = p_event_id AND category_id = p_category_id;
  END remove_category;

  PROCEDURE set_cover_image (p_id IN events.id%TYPE, p_url IN events.cover_image_url%TYPE) IS
  BEGIN
    UPDATE events SET cover_image_url = p_url, updated_on = SYSTIMESTAMP WHERE id = p_id;
  END set_cover_image;

  PROCEDURE set_banner_image (p_id IN events.id%TYPE, p_url IN events.banner_image_url%TYPE) IS
  BEGIN
    UPDATE events SET banner_image_url = p_url, updated_on = SYSTIMESTAMP WHERE id = p_id;
  END set_banner_image;

END gcode_events_api;
/
```

</details>

## gcode_event_participants_api

The core registration package — WhatsApp is now wired in here, deployed (this section reflects the live code, not a proposal).

**`create_participant`** is the single entry point for every registration (guest, signed-in, and paid-via-Razorpay — see `GCODE_PAYMENTS_API.finalize_order` below, which calls this same procedure). Order of operations:
1. Validate quantity ≥ 1 and against `max_tickets_per_registration` (category-specific: `PARTICIPANT` vs `ATTENDEE` limits differ).
2. Unless `p_skip_window_check = 'Y'` (set by the payment path, which already validated the window at order-creation time) and only for guest checkout (`p_user_id IS NULL`), enforce the registration open/close window — again category-specific.
3. Enforce capacity: `participant_capacity` for `PARTICIPANT` category, `max_attendees` for `ATTENDEE`, both computed as `SUM(quantity)` over active rows.
4. **Resolve the user** — three paths, each now also carrying `phone`/`is_phone_verified`:
   - `p_user_id` given → signed-in user, straight lookup.
   - No `p_user_id`, email matches an existing `gcode_users` row → reuse it.
   - No `p_user_id`, no existing user → require a verified row in `gcode_pending_users` (i.e. the guest OTP flow must have run first — this is the "Email not verified" `-20003` error), pull that row's `is_phone_verified` too, then `INSERT INTO gcode_users` (carrying it over) and delete the pending row.
5. Insert the `GCODE_EVENT_PARTICIPANTS` row, `COMMIT`.
6. Fire `GCODE_EMAIL_API.send_confirmation_email` — unconditional, in its own exception-swallowing block.
7. **If `is_phone_verified = 'Y'` and a phone is on file:** build a QR URL and ticket URL (same `api.qrserver.com` / `events.gcode.in/.../registered` shapes `GCODE_EMAIL_API.send_confirmation_email` uses internally, duplicated here since that logic is private to the email package) and fire `GCODE_WHATSAPP_API.send_ticket_confirmation` — also unconditional-once-triggered, own exception-swallowing block. **Additive, not a replacement** — step 6 always runs regardless.

**`submit_audio`** — Participant-category audio submission. Deadline is `NVL(event.participant_registration_deadline, participant.applied_on) + 24 hours`, but **only gates the first submission** (a participant who submitted once can keep replacing the URL past the deadline — the code comment calls this out explicitly, matching the frontend's `isDisqualified` rule in `src/lib/attendees.ts`). On success: updates the row, commits, looks up the user's `email, phone, is_phone_verified`, fires `GCODE_EMAIL_API.send_submission_received_email` unconditionally, then — same additive pattern as `create_participant` — fires `GCODE_WHATSAPP_API.send_submission_received` if phone is verified.

| Procedure | Purpose |
| --- | --- |
| `create_participant` | Registration entry point — validation → user resolution → insert → email (always) → WhatsApp (if phone verified). See above. |
| `update_participant` | Status/active flag update only (e.g. organizer marking attended/cancelled) |
| `submit_audio` | Participant audio-submission with first-time-only deadline gate → email (always) → WhatsApp (if phone verified). See above. |
| `delete_participant` | Hard delete |
| `list_by_event` / `get_participant` | Attendee listing/detail — joins `gcode_users` (email, phone) and `gcode_roles` (role_name); this is what `adaptParticipant()` in `src/lib/api/adapters.ts` maps into the frontend `Attendee` type |
| `list_by_user` | "My registrations" — joins `events` for the attendee-facing ticket list |

**`is_phone_verified` only ever gets set `'Y'` via `AUTH_PKG.verify_phone_otp`** (planned — see the `AUTH_PKG` section), which the frontend only calls if the participant checked the "Also receive updates on WhatsApp" opt-in checkbox during registration. Until that's deployed, `is_phone_verified` stays `'N'` for everyone and the WhatsApp branches below are dead code that never fires — email-only behavior is unchanged from before this feature.

<details>
<summary>Full source</summary>

## gcode_event_participants_api

```sql
create or replace PACKAGE BODY gcode_event_participants_api AS

  PROCEDURE create_participant(
    p_event_id  IN  NUMBER,
    p_email     IN  VARCHAR2  DEFAULT NULL,
    p_full_name IN  VARCHAR2  DEFAULT NULL,
    p_quantity  IN  NUMBER    DEFAULT 1,
    p_status    IN  VARCHAR2  DEFAULT 'PENDING',
    p_active    IN  VARCHAR2  DEFAULT 'Y',
    p_category  IN  VARCHAR2  DEFAULT 'ATTENDEE',
    p_phone     IN  VARCHAR2  DEFAULT NULL,
    p_user_id   IN  NUMBER    DEFAULT NULL,
    p_skip_window_check IN VARCHAR2 DEFAULT 'N',
    p_id        OUT NUMBER
  ) IS
    v_user_id                 gcode_users.user_id%TYPE;
    v_resolved_email          gcode_users.email%TYPE;
    v_resolved_full_name      gcode_users.full_name%TYPE;
    v_phone                   gcode_users.phone%TYPE;
    v_is_phone_verified       gcode_users.is_phone_verified%TYPE;
    v_phone_verified_pending  gcode_pending_users.is_phone_verified%TYPE;
    v_quantity                NUMBER := NVL(p_quantity, 1);
    v_category                VARCHAR2(20) := NVL(p_category, 'ATTENDEE');
    v_max_attendees           events.max_attendees%TYPE;
    v_max_per_reg             events.max_tickets_per_registration%TYPE;
    v_participant_max_per_reg events.participant_max_tickets_per_registration%TYPE;
    v_effective_max_per_reg   NUMBER;
    v_participant_capacity    events.participant_capacity%TYPE;
    v_reg_start               events.registration_start%TYPE;
    v_reg_deadline            events.registration_deadline%TYPE;
    v_participant_reg_start   events.participant_registration_start%TYPE;
    v_participant_reg_deadline events.participant_registration_deadline%TYPE;
    v_effective_reg_start     events.registration_start%TYPE;
    v_effective_reg_deadline  events.registration_deadline%TYPE;
    v_title                   events.title%TYPE;
    v_start_date              events.start_date%TYPE;
    v_when_date                VARCHAR2(100);
    v_qr_url                   VARCHAR2(500);
    v_ticket_url                VARCHAR2(500);
    v_booked                  NUMBER;
    v_verified                NUMBER;
  BEGIN
    IF v_quantity < 1 THEN
      RAISE_APPLICATION_ERROR(-20002, 'Ticket quantity must be at least 1.');
    END IF;

    SELECT max_attendees, max_tickets_per_registration, participant_capacity,
           participant_max_tickets_per_registration,
           registration_start, registration_deadline,
           participant_registration_start, participant_registration_deadline,
           title, start_date
    INTO   v_max_attendees, v_max_per_reg, v_participant_capacity,
           v_participant_max_per_reg,
           v_reg_start, v_reg_deadline,
           v_participant_reg_start, v_participant_reg_deadline,
           v_title, v_start_date
    FROM   events
    WHERE  id = p_event_id;

    v_effective_max_per_reg := CASE WHEN v_category = 'PARTICIPANT'
                                    THEN v_participant_max_per_reg
                                    ELSE v_max_per_reg END;

    IF v_effective_max_per_reg IS NOT NULL AND v_quantity > v_effective_max_per_reg THEN
      RAISE_APPLICATION_ERROR(-20001,
        'Maximum ' || v_effective_max_per_reg || ' ticket(s) allowed per registration.');
    END IF;

    IF NVL(p_skip_window_check, 'N') != 'Y' AND p_user_id IS NULL THEN
      v_effective_reg_start    := CASE WHEN v_category = 'PARTICIPANT'
                                       THEN v_participant_reg_start ELSE v_reg_start END;
      v_effective_reg_deadline := CASE WHEN v_category = 'PARTICIPANT'
                                       THEN v_participant_reg_deadline ELSE v_reg_deadline END;

      IF v_effective_reg_start IS NOT NULL AND SYSTIMESTAMP < v_effective_reg_start THEN
        RAISE_APPLICATION_ERROR(-20004, 'Registration has not opened yet.');
      END IF;
      IF v_effective_reg_deadline IS NOT NULL AND SYSTIMESTAMP > v_effective_reg_deadline THEN
        RAISE_APPLICATION_ERROR(-20004, 'Registration is closed.');
      END IF;
    END IF;

    IF v_category = 'PARTICIPANT' THEN
      IF v_participant_capacity IS NOT NULL THEN
        SELECT NVL(SUM(quantity), 0) INTO v_booked
        FROM GCODE_EVENT_PARTICIPANTS
        WHERE event_id = p_event_id AND active = 'Y' AND category = 'PARTICIPANT';

        IF v_booked + v_quantity > v_participant_capacity THEN
          RAISE_APPLICATION_ERROR(-20001,
            'Only ' || (v_participant_capacity - v_booked) || ' spot(s) left for this event.');
        END IF;
      END IF;
    ELSE
      IF v_max_attendees IS NOT NULL THEN
        SELECT NVL(SUM(quantity), 0) INTO v_booked
        FROM GCODE_EVENT_PARTICIPANTS
        WHERE event_id = p_event_id AND active = 'Y' AND category = 'ATTENDEE';

        IF v_booked + v_quantity > v_max_attendees THEN
          RAISE_APPLICATION_ERROR(-20001,
            'Only ' || (v_max_attendees - v_booked) || ' ticket(s) left for this event.');
        END IF;
      END IF;
    END IF;

    IF p_user_id IS NOT NULL THEN
      SELECT user_id, email, full_name, phone, is_phone_verified
      INTO   v_user_id, v_resolved_email, v_resolved_full_name, v_phone, v_is_phone_verified
      FROM   gcode_users
      WHERE  user_id = p_user_id;
    ELSE
      BEGIN
        SELECT user_id, email, full_name, phone, is_phone_verified
        INTO   v_user_id, v_resolved_email, v_resolved_full_name, v_phone, v_is_phone_verified
        FROM   gcode_users WHERE email = p_email;
      EXCEPTION WHEN NO_DATA_FOUND THEN
        SELECT COUNT(*) INTO v_verified
        FROM gcode_pending_users
        WHERE email = p_email AND is_verified = 'Y';

        IF v_verified = 0 THEN
          RAISE_APPLICATION_ERROR(-20003,
            'Email not verified. Please verify your email before registering.');
        END IF;

        BEGIN
          SELECT is_phone_verified INTO v_phone_verified_pending
          FROM gcode_pending_users WHERE email = p_email;
        EXCEPTION WHEN NO_DATA_FOUND THEN
          v_phone_verified_pending := 'N';
        END;

        BEGIN
          INSERT INTO gcode_users (email, full_name, phone, is_phone_verified)
          VALUES (p_email, p_full_name, p_phone, NVL(v_phone_verified_pending, 'N'))
          RETURNING user_id, email, full_name INTO v_user_id, v_resolved_email, v_resolved_full_name;
          v_phone := p_phone;
          v_is_phone_verified := NVL(v_phone_verified_pending, 'N');
        EXCEPTION WHEN DUP_VAL_ON_INDEX THEN
          SELECT user_id, email, full_name, phone, is_phone_verified
          INTO   v_user_id, v_resolved_email, v_resolved_full_name, v_phone, v_is_phone_verified
          FROM   gcode_users WHERE email = p_email;
        END;

        DELETE FROM gcode_pending_users WHERE email = p_email;
      END;
    END IF;

    INSERT INTO GCODE_EVENT_PARTICIPANTS (
      event_id, user_id, user_name, quantity, applied_on, status, active,
      category, created_by, created_on, updated_by, updated_on
    ) VALUES (
      p_event_id, v_user_id, v_resolved_full_name, v_quantity, SYSTIMESTAMP,
      NVL(p_status, 'PENDING'), NVL(p_active, 'Y'),
      v_category,
      USER, SYSTIMESTAMP, USER, SYSTIMESTAMP
    ) RETURNING id INTO p_id;

    COMMIT;

    BEGIN
      GCODE_EMAIL_API.send_confirmation_email(
        p_email          => v_resolved_email,
        p_full_name      => v_resolved_full_name,
        p_event_id       => p_event_id,
        p_participant_id => p_id,
        p_quantity       => v_quantity,
        p_category       => v_category
      );
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;

    IF v_is_phone_verified = 'Y' AND v_phone IS NOT NULL THEN
      v_when_date := CASE WHEN v_start_date IS NOT NULL THEN TO_CHAR(v_start_date, 'DD Mon YYYY') ELSE 'TBA' END;
      v_qr_url := 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='
                  || APEX_UTIL.URL_ENCODE('GCODE-PARTICIPANT-' || p_id);
      v_ticket_url := 'https://events.gcode.in/events/' || p_event_id || '/registered?pid=' || p_id;

      BEGIN
        GCODE_WHATSAPP_API.send_ticket_confirmation(
          p_phone       => v_phone,
          p_full_name   => v_resolved_full_name,
          p_event_title => v_title,
          p_when_date   => v_when_date,
          p_booking_ref => 'GCODE-P' || p_id,
          p_qr_url      => v_qr_url,
          p_ticket_url  => v_ticket_url
        );
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;
    END IF;
  END create_participant;

  PROCEDURE update_participant(
    p_id     IN NUMBER,
    p_status IN VARCHAR2  DEFAULT NULL,
    p_active IN VARCHAR2  DEFAULT NULL
  ) IS
  BEGIN
    UPDATE GCODE_EVENT_PARTICIPANTS SET
      status     = NVL(p_status, status),
      active     = NVL(p_active, active),
      updated_by = USER,
      updated_on = SYSTIMESTAMP
    WHERE id = p_id;
    COMMIT;
  END update_participant;

 PROCEDURE submit_audio(
    p_id                 IN  NUMBER,
    p_audio_url          IN  VARCHAR2,
    p_audio_submitted_on OUT TIMESTAMP WITH TIME ZONE
  ) IS
    v_email               gcode_users.email%TYPE;
    v_phone               gcode_users.phone%TYPE;
    v_is_phone_verified   gcode_users.is_phone_verified%TYPE;
    v_full_name           GCODE_EVENT_PARTICIPANTS.user_name%TYPE;
    v_event_id            GCODE_EVENT_PARTICIPANTS.event_id%TYPE;
    v_event_title         events.title%TYPE;
    v_user_id             GCODE_EVENT_PARTICIPANTS.user_id%TYPE;
    v_applied_on          GCODE_EVENT_PARTICIPANTS.applied_on%TYPE;
    v_reg_deadline        EVENTS.participant_registration_deadline%TYPE;
    v_submission_deadline TIMESTAMP WITH TIME ZONE;
  BEGIN
    BEGIN
      SELECT p.event_id, p.applied_on
        INTO v_event_id, v_applied_on
        FROM gcode_event_participants p
       WHERE p.id = p_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20005, 'Participant not found.');
    END;

    -- Only the first submission is deadline-gated — once submitted, the
    -- participant can keep replacing it, matching the frontend's
    -- isDisqualified rule (past deadline AND no submission yet).

      SELECT e.participant_registration_deadline
        INTO v_reg_deadline
        FROM events e
       WHERE e.id = v_event_id;

      v_submission_deadline :=
        NVL(v_reg_deadline, v_applied_on) + INTERVAL '24' HOUR;

      IF SYSTIMESTAMP > v_submission_deadline THEN
        RAISE_APPLICATION_ERROR(-20011, 'Submission window has closed.');
      END IF;


    UPDATE gcode_event_participants
    SET audio_submission_url = p_audio_url,
        audio_submitted_on   = SYSTIMESTAMP
    WHERE id = p_id
    RETURNING audio_submitted_on, user_name, event_id, user_id
      INTO p_audio_submitted_on, v_full_name, v_event_id, v_user_id;

    IF SQL%ROWCOUNT = 0 THEN
      RAISE_APPLICATION_ERROR(-20005, 'Participant not found.');
    END IF;

    COMMIT;

    BEGIN
      SELECT email, phone, is_phone_verified
      INTO   v_email, v_phone, v_is_phone_verified
      FROM   gcode_users WHERE user_id = v_user_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      v_email := NULL;
      v_phone := NULL;
      v_is_phone_verified := 'N';
    END;

    IF v_email IS NOT NULL THEN
      BEGIN
        GCODE_EMAIL_API.send_submission_received_email(v_email, v_full_name, v_event_id, p_id, p_audio_url);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;

    IF v_is_phone_verified = 'Y' AND v_phone IS NOT NULL THEN
      BEGIN
        SELECT title INTO v_event_title FROM events WHERE id = v_event_id;
        GCODE_WHATSAPP_API.send_submission_received(v_phone, v_full_name, v_event_title);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END submit_audio;



  PROCEDURE delete_participant(p_id IN NUMBER) IS
  BEGIN
    DELETE FROM GCODE_EVENT_PARTICIPANTS WHERE id = p_id;
    COMMIT;
  END delete_participant;

  PROCEDURE list_by_event(p_event_id IN NUMBER, p_result OUT SYS_REFCURSOR) IS
  BEGIN
    OPEN p_result FOR
      SELECT p.id            AS "id",
             p.event_id       AS "event_id",
             TO_CHAR(p.user_id)        AS "user_id",
             p.user_name      AS "user_name",
             p.quantity       AS "quantity",
             p.status         AS "status",
             p.active         AS "active",
             p.applied_on     AS "applied_on",
             gu.email         AS "email",
             gu.phone         AS "phone",
             gr.role_name     AS "role_name",
             p.category       AS "category",
             p.audio_submission_url AS "audio_submission_url",
             p.audio_submitted_on   AS "audio_submitted_on"
      FROM GCODE_EVENT_PARTICIPANTS p
      LEFT JOIN gcode_users gu ON gu.user_id = p.user_id
      LEFT JOIN gcode_roles gr ON gr.role_id = gu.role_id
      WHERE p.event_id = p_event_id
      ORDER BY p.applied_on DESC;
  END list_by_event;

  PROCEDURE get_participant(p_id IN NUMBER, p_result OUT SYS_REFCURSOR) IS
  BEGIN
    OPEN p_result FOR
      SELECT p.id            AS "id",
             p.event_id       AS "event_id",
             TO_CHAR(p.user_id)     AS "user_id",
             p.user_name      AS "user_name",
             p.quantity       AS "quantity",
             p.status         AS "status",
             p.active         AS "active",
             p.applied_on     AS "applied_on",
             gu.email         AS "email",
             gu.phone         AS "phone",
             gr.role_name     AS "role_name",
             p.category       AS "category",
             p.audio_submission_url AS "audio_submission_url",
             p.audio_submitted_on   AS "audio_submitted_on"
      FROM GCODE_EVENT_PARTICIPANTS p
      LEFT JOIN gcode_users gu ON gu.user_id = p.user_id
      LEFT JOIN gcode_roles gr ON gr.role_id = gu.role_id
      WHERE p.id = p_id;
  END get_participant;

  PROCEDURE list_by_user(p_user_id IN NUMBER, p_result OUT SYS_REFCURSOR) IS
  BEGIN
    OPEN p_result FOR
      SELECT p.id               AS "participant_id",
             p.event_id         AS "event_id",
             e.title            AS "event_name",
             e.event_type_id    AS "event_type_id",
             e.mode_of_event_id AS "mode_of_event_id",
             e.status_id        AS "status_id",
             e.start_date       AS "start_date",
             e.city             AS "city",
             e.venue_address    AS "address",
             e.ticket_price     AS "ticket_price",
             e.participant_price AS "participant_price",
             e.cover_image_url  AS "cover_image_url",
             p.quantity         AS "quantity",
             p.status           AS "status",
             p.active            AS "active",
             p.applied_on        AS "applied_on",
             p.category           AS "category"
      FROM GCODE_EVENT_PARTICIPANTS p
      JOIN events e ON e.id = p.event_id
      WHERE p.user_id = p_user_id
      ORDER BY e.start_date DESC NULLS LAST;
  END list_by_user;

END gcode_event_participants_api;
/
```

</details>

## GCODE_PAYMENTS_API

Razorpay integration. `get_secret`/`sha256`/`normalize_key`/`hmac_hex`/`basic_auth_header` are hand-rolled crypto primitives (Oracle has no native HMAC-SHA256 UDF, so this reimplements it from `STANDARD_HASH` + raw XOR padding) used two ways: `basic_auth_header` for authenticating the order-creation call to Razorpay, `hmac_hex` for verifying both the client-side payment signature (`verify_and_register`) and the webhook signature (`process_webhook`). `GCODE_APP_SECRETS` is the generic secret-storage table this package reads from — the natural home for `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` too, rather than inventing a new mechanism.

| Procedure | Purpose |
| --- | --- |
| `get_secret` | Internal — reads `GCODE_APP_SECRETS` by name |
| `sha256` / `normalize_key` / `hmac_hex` | Internal — hand-rolled HMAC-SHA256 |
| `basic_auth_header` | Internal — Razorpay Basic-auth header from key id/secret |
| `finalize_order` | Internal — idempotent (checks `status = 'PAID'` first) completion: calls `gcode_event_participants_api.create_participant` with `p_skip_window_check => 'Y'`, then marks the order `PAID` |
| `create_order` | `POST /events/{id}/razorpay-order` — computes amount server-side from `ticket_price`/`participant_price × quantity`, never trusts a client-sent amount |
| `verify_and_register` | Client-side payment-confirmation path — verifies the Razorpay signature, then `finalize_order` |
| `process_webhook` | Razorpay webhook — verifies webhook signature, dedupes by `razorpay_event_id`, calls `finalize_order` on `payment.captured` |

No direct changes needed for the WhatsApp work — `finalize_order` → `create_participant` means paid registrations automatically get whatever channel logic lands in `create_participant`, for free.

<details>
<summary>Full source</summary>

## GCODE_PAYMENTS_API

```sql
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
    v_row GCODE_PAYMENT_ORDERS%ROWTYPE;
  BEGIN
    SELECT * INTO v_row
      FROM GCODE_PAYMENT_ORDERS
     WHERE razorpay_order_id = p_razorpay_order_id
     FOR UPDATE;

    IF v_row.status = 'PAID' THEN
      RETURN v_row.participant_id;
    END IF;

    GCODE_EVENT_PARTICIPANTS_API.create_participant(
      p_event_id  => v_row.event_id,
      p_email     => v_row.email,
      p_full_name => v_row.full_name,
      p_quantity  => v_row.quantity,
      p_status    => 'CONFIRMED',
      p_category  => NVL(v_row.category, 'ATTENDEE'),
      p_phone     => v_row.phone,
      p_skip_window_check => 'Y',
      p_id        => v_row.participant_id
    );

    UPDATE GCODE_PAYMENT_ORDERS
       SET status = 'PAID',
           razorpay_payment_id = p_razorpay_payment_id,
           participant_id = v_row.participant_id,
           paid_on = SYSTIMESTAMP
     WHERE id = v_row.id;

    RETURN v_row.participant_id;
  END finalize_order;

  PROCEDURE create_order(
    p_event_id  IN NUMBER,
    p_email     IN VARCHAR2 DEFAULT NULL,
    p_full_name IN VARCHAR2 DEFAULT NULL,
    p_quantity  IN NUMBER,
    p_category  IN VARCHAR2 DEFAULT 'ATTENDEE',
    p_phone     IN VARCHAR2 DEFAULT NULL,
    p_user_id   IN NUMBER   DEFAULT NULL,
    p_order_id  OUT VARCHAR2,
    p_amount    OUT NUMBER,
    p_currency  OUT VARCHAR2,
    p_key_id    OUT VARCHAR2
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
      category, phone
    )
    VALUES (
      p_event_id, v_order_id, p_quantity, v_amount_paise, 'INR', v_email, v_full_name,
      v_category, v_phone
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
```

</details>

## AUTH_PKG

Auth/session. JWTs are signed with `APEX_JWT` using a hardcoded symmetric secret (`c_jwt_secret`, 7-day expiry, `iss='GCODE'`/`aud='GCODE_FRONTEND'`) — `generate_jwt`/`verify_token`/`get_verified_user_id` are the encode/decode/extract trio every other authenticated call relies on (`get_verified_user_id` is what `AUTH_PKG.get_verified_user_id` in `list_by_user`'s ORDS binding uses to resolve `p_token` → `user_id` server-side, per the comment in `src/lib/api/participants.ts:41`).

Two distinct registration flows share the `gcode_pending_users` staging table (OTP + optional password hash, `is_verified` flag, 15-minute expiry):
- **Guest checkout** (`send_guest_otp`) — no password, `full_name`/`phone` optional, just proves email ownership before `gcode_event_participants_api.create_participant` will accept that email.
- **Full sign-up** (`sign_up` → `verify_otp` → `select_stakeholder`) — same OTP mechanism but requires a password and ends with role selection, which is where the `gcode_pending_users` row actually gets promoted into `gcode_users` (or, if `select_stakeholder` finds no pending row, falls back to an already-existing-but-roleless user — the Google OAuth "signed up, never picked a role" case).

| Procedure | Purpose |
| --- | --- |
| `generate_jwt` / `verify_token` / `get_verified_user_id` | Internal JWT encode/decode/extract |
| `send_guest_otp` | Guest-checkout email verification — merges into `gcode_pending_users`, sends OTP email |
| `sign_up` | Full sign-up — same OTP mechanism, plus password hash, rejects if email already in `gcode_users` |
| `verify_otp` | Marks a `gcode_pending_users` row verified if the code matches and hasn't expired |
| `select_stakeholder` | Promotes a verified pending row into `gcode_users` with a chosen role (or assigns a role to an existing roleless user, e.g. post-OAuth); issues the JWT |
| `sign_in` | Email+password → JWT |
| `oauth_login` | Verifies a Google `id_token` against `tokeninfo`, creates-or-finds the `gcode_users` row (role `NONE` until `select_stakeholder` runs) |
| `request_password_reset` / `reset_password` | Token-based reset, 30-minute expiry, always returns the same message whether or not the email exists (no user enumeration) |
| `send_phone_otp` / `verify_phone_otp` | Phone verification over WhatsApp for event registration — same `gcode_pending_users` staging row `send_guest_otp` uses, same sessionless-guest scope, just a second channel. Added here (not a separate package) because `send_guest_otp` already establishes that `AUTH_PKG` is the general contact-verification utility for the sessionless registration path, not strictly a login/session package — see the plan file for the reasoning. |

**Email verification (`send_guest_otp`, `sign_up`) itself stays email-only** — `send_phone_otp` is an additional, independent verification, not a channel switch for the existing email OTP. Sign-in/reset/OAuth are untouched by any of this.

<details>
<summary>Full source</summary>

## AUTH_PKG

```sql
create or replace PACKAGE BODY AUTH_PKG AS

        c_jwt_secret CONSTANT RAW(256) := UTL_I18N.STRING_TO_RAW('GCODE_SUPER_SECRET_JWT_SIGNATURE_KEY_2026_!@#', 'AL32UTF8');

        FUNCTION generate_jwt(
            p_user_id   IN NUMBER,
            p_role_name IN VARCHAR2,
            p_full_name IN VARCHAR2 DEFAULT NULL
        ) RETURN VARCHAR2 IS
        BEGIN
            RETURN APEX_JWT.ENCODE (
                p_iss           => 'GCODE',
                p_sub           => TO_CHAR(p_user_id),
                p_aud           => 'GCODE_FRONTEND',
                p_exp_sec       => 604800,
                p_other_claims  => '"role": "' || NVL(p_role_name, 'NONE') || '", ' ||
                                    '"full_name": "' || REPLACE(NVL(p_full_name, ''), '"', '\"') || '"',
                p_signature_key => c_jwt_secret
            );
        END generate_jwt;

        PROCEDURE verify_token(
            p_token       IN  VARCHAR2,
            p_status_code OUT NUMBER
        ) IS
            l_token     apex_jwt.t_token;
            v_user_id   NUMBER;
            v_role_name VARCHAR2(100);
            v_full_name VARCHAR2(200);
        BEGIN
            l_token := apex_jwt.decode(
                p_value         => p_token,
                p_signature_key => c_jwt_secret
            );

            apex_jwt.validate(
                p_token          => l_token,
                p_iss            => 'GCODE',
                p_aud            => 'GCODE_FRONTEND',
                p_leeway_seconds => 0
            );

            apex_json.parse(l_token.payload);
            v_user_id   := TO_NUMBER(apex_json.get_varchar2(p_path => 'sub'));
            v_role_name := apex_json.get_varchar2(p_path => 'role');
            v_full_name := apex_json.get_varchar2(p_path => 'full_name');

            p_status_code := 200;
            HTP.print('{ "user_id": ' || v_user_id ||
                      ', "role_name": "' || NVL(v_role_name, 'NONE') || '"' ||
                      ', "full_name": "' || REPLACE(NVL(v_full_name, ''), '"', '\"') || '"' ||
                      ' }');
        EXCEPTION
            WHEN VALUE_ERROR THEN
                p_status_code := 401;
                HTP.print('{ "error": "Invalid or expired token" }');
            WHEN OTHERS THEN
                p_status_code := 401;
                HTP.print('{ "error": "Invalid token" }');
        END verify_token;

        PROCEDURE send_guest_otp(
            p_email       IN  VARCHAR2,
            p_full_name   IN  VARCHAR2 DEFAULT NULL,
            p_phone       IN  VARCHAR2 DEFAULT NULL,
            p_status_code OUT NUMBER
        ) IS
            v_otp_code VARCHAR2(6);
        BEGIN
            IF p_email IS NULL OR p_email NOT LIKE '%_@_%.__%' THEN
                p_status_code := 400;
                HTP.print('{ "error": "Valid email is required" }');
                RETURN;
            END IF;

            v_otp_code := DBMS_RANDOM.STRING('X', 6);

            MERGE INTO gcode_pending_users t
            USING (SELECT p_email AS email FROM dual) s
            ON (t.email = s.email)
            WHEN MATCHED THEN
                UPDATE SET
                    full_name   = NVL(t.full_name, p_full_name),
                    phone       = NVL(t.phone, p_phone),
                    otp_code    = v_otp_code,
                    expires_at  = SYSTIMESTAMP + INTERVAL '15' MINUTE,
                    is_verified = 'N'
            WHEN NOT MATCHED THEN
                INSERT (email, full_name, phone, otp_code, expires_at)
                VALUES (p_email, p_full_name, p_phone, v_otp_code, SYSTIMESTAMP + INTERVAL '15' MINUTE);

            BEGIN
                GCODE_EMAIL_API.send_otp_email(p_email, NVL(p_full_name, 'there'), v_otp_code);
            EXCEPTION
                WHEN OTHERS THEN
                    ROLLBACK;
                    p_status_code := 500;
                    HTP.print('{ "error": "Failed to send email: ' || REPLACE(SQLERRM, '"', '''') || '" }');
                    RETURN;
            END;

            COMMIT;
            p_status_code := 200;
            -- REMOVED dev_test_otp from response — was a dev-only
            -- convenience, no longer echoed now that real email delivery
            -- is confirmed working.
            HTP.print('{ "message": "OTP sent to email" }');
        EXCEPTION
            WHEN OTHERS THEN
                p_status_code := 500;
                HTP.print('{ "error": "Internal server error" }');
        END send_guest_otp;

        PROCEDURE sign_up(
            p_email       IN  VARCHAR2,
            p_full_name   IN  VARCHAR2,
            p_phone       IN  VARCHAR2,
            p_password    IN  VARCHAR2,
            p_status_code OUT NUMBER
        ) IS
            v_exists   NUMBER;
            v_otp_code VARCHAR2(6);
        BEGIN
            IF p_password IS NULL THEN
                p_status_code := 400;
                HTP.print('{ "error": "Password is required" }');
                RETURN;
            END IF;

            SELECT COUNT(*) INTO v_exists FROM gcode_users WHERE email = p_email;
            IF v_exists > 0 THEN
                p_status_code := 409;
                HTP.print('{ "error": "Email already exists" }');
                RETURN;
            END IF;

            v_otp_code := DBMS_RANDOM.STRING('X', 6);

            MERGE INTO gcode_pending_users t
            USING (SELECT p_email as email FROM dual) s
            ON (t.email = s.email)
            WHEN MATCHED THEN
                UPDATE SET full_name = p_full_name, phone = p_phone, password_hash = p_password, otp_code = v_otp_code, expires_at = SYSTIMESTAMP + INTERVAL '15'
                MINUTE, is_verified = 'N'
            WHEN NOT MATCHED THEN
                INSERT (email, full_name, phone, password_hash, otp_code, expires_at)
                VALUES (p_email, p_full_name, p_phone, p_password, v_otp_code, SYSTIMESTAMP + INTERVAL '15' MINUTE);

            BEGIN
                GCODE_EMAIL_API.send_otp_email(p_email, p_full_name, v_otp_code);
            EXCEPTION
                WHEN OTHERS THEN
                    ROLLBACK;
                    p_status_code := 500;
                   HTP.print('{
                        "status": "error",
                        "message": "Failed to send email. EXACT ERROR: ' || REPLACE(SQLERRM, '"', '''') || '"
                    }');
                    RETURN;
            END;

            COMMIT;
            p_status_code := 201;
            -- REMOVED dev_test_otp from response — see send_guest_otp above.
            HTP.print('{ "message": "OTP sent to email" }');

        EXCEPTION
            WHEN OTHERS THEN
                p_status_code := 500;
                HTP.print('{ "error": "Internal server error" }');
        END sign_up;

        PROCEDURE verify_otp(
            p_email       IN  VARCHAR2,
            p_otp_code    IN  VARCHAR2,
            p_status_code OUT NUMBER
        ) IS
        BEGIN
            UPDATE gcode_pending_users
            SET is_verified = 'Y'
            WHERE email = p_email
              AND UPPER(TRIM(otp_code)) = UPPER(TRIM(p_otp_code))
              AND expires_at > SYSTIMESTAMP;

            IF SQL%ROWCOUNT > 0 THEN
                COMMIT;
                p_status_code := 200;
                HTP.print('{ "message": "OTP verified successfully" }');
            ELSE
                p_status_code := 401;
                HTP.print('{ "error": "Invalid or expired OTP" }');
            END IF;
        END verify_otp;

        PROCEDURE select_stakeholder(
    p_email       IN  VARCHAR2,
    p_role_name   IN  VARCHAR2,
    p_status_code OUT NUMBER
) IS
    v_pending           gcode_pending_users%ROWTYPE;
    v_role_id           NUMBER;
    v_user_id           NUMBER;
    v_full_name         VARCHAR2(200);
    v_jwt               VARCHAR2(4000);
    v_pending_cnt       NUMBER;
    v_existing_role_id  NUMBER;
BEGIN
    BEGIN
        SELECT role_id INTO v_role_id FROM gcode_roles WHERE UPPER(role_name) = UPPER(p_role_name);
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_status_code := 404;
            HTP.print('{ "error": "Role not found in database" }');
            RETURN;
    END;

    SELECT COUNT(*) INTO v_pending_cnt
    FROM gcode_pending_users WHERE email = p_email AND is_verified = 'Y';

    IF v_pending_cnt > 0 THEN
        SELECT * INTO v_pending FROM gcode_pending_users WHERE email = p_email AND is_verified = 'Y';

        INSERT INTO gcode_users (email, full_name, phone, password_hash, role_id)
        VALUES (v_pending.email, v_pending.full_name, v_pending.phone, v_pending.password_hash, v_role_id)
        RETURNING user_id INTO v_user_id;

        v_full_name := v_pending.full_name;
        DELETE FROM gcode_pending_users WHERE email = p_email;
    ELSE
        BEGIN
            SELECT user_id, full_name, role_id
            INTO v_user_id, v_full_name, v_existing_role_id
            FROM gcode_users WHERE email = p_email;

            IF v_existing_role_id IS NOT NULL THEN
                p_status_code := 403;
                HTP.print('{ "error": "Email not verified or session expired" }');
                RETURN;
            END IF;

            UPDATE gcode_users SET role_id = v_role_id WHERE user_id = v_user_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_status_code := 403;
                HTP.print('{ "error": "Email not verified or session expired" }');
                RETURN;
        END;
    END IF;

    COMMIT;

    v_jwt := generate_jwt(v_user_id, UPPER(p_role_name), v_full_name);
    p_status_code := 200;
    HTP.print('{ "message": "Registration complete", "token": "' || v_jwt || '" }');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_status_code := 500;
        HTP.print('{ "error": "Internal Server Error" }');
END select_stakeholder;

        PROCEDURE sign_in(
            p_email       IN  VARCHAR2,
            p_password    IN  VARCHAR2,
            p_status_code OUT NUMBER
        ) IS
            v_user_id   NUMBER;
            v_role_name VARCHAR2(100);
            v_full_name VARCHAR2(200);
            v_jwt       VARCHAR2(4000);
        BEGIN
            SELECT u.user_id, r.role_name, u.full_name
            INTO v_user_id, v_role_name, v_full_name
            FROM gcode_users u
            LEFT JOIN gcode_roles r ON u.role_id = r.role_id
            WHERE u.email = p_email AND u.password_hash = p_password;

            v_jwt := generate_jwt(v_user_id, v_role_name, v_full_name);

            p_status_code := 200;
            HTP.print('{ "user_id": ' || v_user_id || ', "role_name": "' || NVL(v_role_name, 'NONE') || '", "token": "' || v_jwt || '" }');
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_status_code := 401;
                HTP.print('{ "error": "Invalid email or password" }');
            WHEN OTHERS THEN
                p_status_code := 500;
                HTP.print('{ "error": "Internal Server Error" }');
        END sign_in;

        PROCEDURE oauth_login(
          p_id_token    IN  VARCHAR2,
          p_status_code OUT NUMBER
      ) IS
          v_url             VARCHAR2(4000);
          v_response        CLOB;
          v_email           VARCHAR2(320);
          v_full_name       VARCHAR2(200);
          v_aud             VARCHAR2(400);
          v_email_verified  VARCHAR2(10);
          v_user_id         NUMBER;
          v_role_name       VARCHAR2(100);
          v_exists          NUMBER;
          v_jwt             VARCHAR2(4000);
       BEGIN
          v_url := 'https://oauth2.googleapis.com/tokeninfo?id_token=' || apex_util.url_encode(p_id_token);

          v_response := apex_web_service.make_rest_request(
              p_url         => v_url,
              p_http_method => 'GET'
          );

          apex_json.parse(v_response);

          IF apex_json.does_exist(p_path => 'error') then
              p_status_code := 401;
              HTP.print('{ "error": "Invalid Google token" }');
              RETURN;
          END IF;

          v_aud            := apex_json.get_varchar2(p_path => 'aud');
          v_email          := apex_json.get_varchar2(p_path => 'email');
          v_email_verified := apex_json.get_varchar2(p_path => 'email_verified');
          v_full_name      := apex_json.get_varchar2(p_path => 'name');

          IF v_aud != '867690808859-8jkehlv74spbs12j1r3m0tn8uu3rjpjp.apps.googleusercontent.com'
             OR v_email_verified != 'true'
          THEN
              p_status_code := 401;
              HTP.print('{ "error": "Invalid token audience or unverified email" }');
              RETURN;
          END IF;

           SELECT COUNT(*) INTO v_exists FROM gcode_users WHERE email = v_email;

          IF v_exists = 0 THEN
              INSERT INTO gcode_users (email, full_name, password_hash)
              VALUES (v_email, NVL(v_full_name, 'User'), NULL)
              RETURNING user_id INTO v_user_id;
              v_role_name := 'NONE';
              p_status_code := 201;
          ELSE
              SELECT u.user_id, r.role_name
              INTO v_user_id, v_role_name
              FROM gcode_users u
              LEFT JOIN gcode_roles r ON u.role_id = r.role_id
              WHERE u.email = v_email;
              p_status_code := 200;
          END IF;

          v_jwt := generate_jwt(v_user_id, v_role_name, v_full_name);
          HTP.print('{ "user_id": ' || v_user_id || ', "role_name": "' || NVL(v_role_name, 'NONE') || '", "token": "' || v_jwt || '" }');
      EXCEPTION
        WHEN OTHERS THEN
          p_status_code := 500;
          HTP.print('{ "error": "' || SQLERRM || '" }');
    END oauth_login;

     PROCEDURE request_password_reset(
     p_email       IN  VARCHAR2,
     p_origin      IN  VARCHAR2,
     p_status_code OUT NUMBER
 ) IS
     v_exists     NUMBER;
     v_full_name  VARCHAR2(200);
     v_token      VARCHAR2(64);
     v_link       VARCHAR2(500);
 BEGIN
     SELECT COUNT(*), MAX(full_name) INTO v_exists, v_full_name
     FROM gcode_users WHERE email = p_email;

     IF v_exists = 0 THEN
         p_status_code := 200;
         HTP.print('{ "message": "If that email is registered, a reset link has been sent" }');
         RETURN;
     END IF;

    v_token := RAWTOHEX(SYS_GUID());

     DELETE FROM gcode_password_resets WHERE email = p_email;

     INSERT INTO gcode_password_resets (token, email, expires_at)
     VALUES (v_token, p_email, SYSTIMESTAMP + INTERVAL '30' MINUTE);

     v_link := p_origin || '/reset-password?token=' || v_token;

     GCODE_EMAIL_API.send_reset_email(p_email, v_full_name, v_link);

     COMMIT;
     p_status_code := 200;
     HTP.print('{ "message": "If that email is registered, a reset link has been sent" }');
 EXCEPTION
     WHEN OTHERS THEN
         ROLLBACK;
         p_status_code := 500;
         HTP.print('{ "error": "Internal Server Error" }');
 END request_password_reset;

  PROCEDURE reset_password(
     p_token           IN  VARCHAR2,
     p_new_password    IN  VARCHAR2,
     p_status_code OUT NUMBER
 ) IS
     v_email  VARCHAR2(320);
 BEGIN
     BEGIN
         SELECT email INTO v_email
         FROM gcode_password_resets
         WHERE token = p_token AND expires_at > SYSTIMESTAMP;
     EXCEPTION
         WHEN NO_DATA_FOUND THEN
             p_status_code := 401;
             HTP.print('{ "error": "Reset link is invalid or has expired" }');
             RETURN;
     END;

     UPDATE gcode_users SET password_hash = p_new_password WHERE email = v_email;
     DELETE FROM gcode_password_resets WHERE token = p_token;

     COMMIT;
     p_status_code := 200;
     HTP.print('{ "message": "Password updated" }');
 EXCEPTION
     WHEN OTHERS THEN
         ROLLBACK;
         p_status_code := 500;
         HTP.print('{ "error": "Internal Server Error" }');
 END reset_password;

  FUNCTION get_verified_user_id(p_token IN VARCHAR2) RETURN NUMBER IS
            l_token   apex_jwt.t_token;
            v_user_id NUMBER;
        BEGIN
            l_token := apex_jwt.decode(
                p_value         => p_token,
                p_signature_key => c_jwt_secret
            );
            apex_jwt.validate(
                p_token          => l_token,
                p_iss            => 'GCODE',
                p_aud            => 'GCODE_FRONTEND',
                p_leeway_seconds => 0
            );
            apex_json.parse(l_token.payload);
            v_user_id := TO_NUMBER(apex_json.get_varchar2(p_path => 'sub'));
            RETURN v_user_id;
        END get_verified_user_id;

        PROCEDURE send_phone_otp(
  p_email       IN  VARCHAR2,   -- keys the same gcode_pending_users row the email OTP flow uses
  p_phone       IN  VARCHAR2,
  p_status_code OUT NUMBER
) IS
  v_otp_code VARCHAR2(6);
BEGIN
  IF p_phone IS NULL THEN
    p_status_code := 400;
    HTP.print('{ "error": "Phone number is required" }');
    RETURN;
  END IF;

  v_otp_code := DBMS_RANDOM.STRING('X', 6);

  MERGE INTO gcode_pending_users t
  USING (SELECT p_email AS email FROM dual) s
  ON (t.email = s.email)
  WHEN MATCHED THEN
    UPDATE SET phone = p_phone, phone_otp_code = v_otp_code,
               phone_otp_expires_at = SYSTIMESTAMP + INTERVAL '15' MINUTE,
               is_phone_verified = 'N'
  WHEN NOT MATCHED THEN
    INSERT (email, phone, phone_otp_code, phone_otp_expires_at)
    VALUES (p_email, p_phone, v_otp_code, SYSTIMESTAMP + INTERVAL '15' MINUTE);

  BEGIN
    GCODE_WHATSAPP_API.send_otp(p_phone, v_otp_code);
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      p_status_code := 500;
      HTP.print('{ "error": "Failed to send WhatsApp OTP: ' || REPLACE(SQLERRM, '"', '''') || '" }');
      RETURN;
  END;

  COMMIT;
  p_status_code := 200;
  HTP.print('{ "message": "OTP sent to WhatsApp" }');
EXCEPTION
  WHEN OTHERS THEN
    p_status_code := 500;
    HTP.print('{ "error": "Internal server error" }');
END send_phone_otp;

PROCEDURE verify_phone_otp(
  p_email       IN  VARCHAR2,
  p_otp_code    IN  VARCHAR2,
  p_status_code OUT NUMBER
) IS
BEGIN
  UPDATE gcode_pending_users
  SET is_phone_verified = 'Y'
  WHERE email = p_email
    AND UPPER(TRIM(phone_otp_code)) = UPPER(TRIM(p_otp_code))
    AND phone_otp_expires_at > SYSTIMESTAMP;

  IF SQL%ROWCOUNT > 0 THEN
    -- Also sync onto gcode_users immediately if that row already exists
    -- (returning guest re-verifying a phone) — create_participant only
    -- reads gcode_pending_users at brand-new-user creation time, so an
    -- existing row needs this direct sync to pick up the new verification.
    UPDATE gcode_users SET is_phone_verified = 'Y'
    WHERE email = p_email;

    COMMIT;
    p_status_code := 200;
    HTP.print('{ "message": "Phone verified successfully" }');
  ELSE
    p_status_code := 401;
    HTP.print('{ "error": "Invalid or expired OTP" }');
  END IF;
END verify_phone_otp;

    END AUTH_PKG;
/
```

</details>
