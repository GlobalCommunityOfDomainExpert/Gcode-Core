"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/molecules";
import { AuthCard } from "../_components/auth-card";
import { SignInForm } from "../_components/sign-in-form";

export default function SignInPage() {
  const router = useRouter();

  return (
    <Modal open onClose={() => router.back()} size="lg" bodyClassName="p-0">
      <AuthCard
        variant="modal"
        title="Welcome Back"
        subtitle="Sign in to your GCODE account"
      >
        <SignInForm />
      </AuthCard>
    </Modal>
  );
}
