import { Button, Input } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { AuthCard } from "../_components/auth-card";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      subtitle="Please choose a new, secure password."
    >
      <form action="/sign-in" method="GET" className="flex flex-col gap-4">
        <FormField label="New Password" htmlFor="password">
          <Input id="password" type="password" placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm New Password" htmlFor="confirm-password">
          <Input id="confirm-password" type="password" placeholder="••••••••" />
        </FormField>

        <Button type="submit" variant="primary" className="w-full">
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}
