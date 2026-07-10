"use client";

import { useRef } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

// The library only yields an id_token (as opposed to an opaque access_token)
// via <GoogleLogin>, which renders Google's own button. We render it hidden
// and forward our custom-styled GoogleButton's click to it, so the rest of
// the app can keep treating this as `await requestGoogleIdToken()`.
export function useGoogleIdToken() {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolverRef = useRef<{
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  } | null>(null);

  const hiddenButton = (
    <div ref={containerRef} style={{ display: "none" }}>
      <GoogleLogin
        onSuccess={(res: CredentialResponse) => {
          if (res.credential) resolverRef.current?.resolve(res.credential);
          else resolverRef.current?.reject(new Error("google_no_credential"));
          resolverRef.current = null;
        }}
        onError={() => {
          resolverRef.current?.reject(new Error("google_prompt_unavailable"));
          resolverRef.current = null;
        }}
      />
    </div>
  );

  function requestGoogleIdToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const btn = containerRef.current?.querySelector<HTMLElement>(
        'div[role="button"]',
      );
      if (!btn) {
        reject(new Error("google_script_not_loaded"));
        return;
      }
      resolverRef.current = { resolve, reject };
      btn.click();
    });
  }

  return { hiddenButton, requestGoogleIdToken };
}

// The id_token's own payload already carries the email (standard OIDC
// claim) — decode it client-side just to thread it through the sign-up
// redirect; the backend independently re-verifies the token itself.
export function decodeGoogleEmail(idToken: string): string {
  const payload = JSON.parse(
    atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
  );
  return payload.email ?? "";
}
