"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import SignInPage from "@/app/(auth)/sign-in/page";

export default function InterceptedSignInPage() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
    >
      <SignInPage />
    </GoogleOAuthProvider>
  );
}
