"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";

export default function InterceptedForgotPasswordPage() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
    >
      <ForgotPasswordPage />
    </GoogleOAuthProvider>
  );
}
