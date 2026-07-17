import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GuestShell } from "@/components/layout";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      <GuestShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          {children}
        </div>
      </GuestShell>
    </GoogleOAuthProvider>
  );
}
