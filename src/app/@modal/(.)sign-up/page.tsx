"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import SignUpPage from "@/app/(auth)/sign-up/page";

export default function InterceptedSignUpPage() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
    >
      <SignUpPage />
    </GoogleOAuthProvider>
  );
}
