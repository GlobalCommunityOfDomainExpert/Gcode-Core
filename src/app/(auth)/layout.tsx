import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      <div className="bg-bg-subtle flex min-h-screen items-center justify-center p-6">
        {children}
      </div>
    </GoogleOAuthProvider>
  );
}
