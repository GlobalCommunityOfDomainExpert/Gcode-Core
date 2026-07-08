import NextLink from "next/link";
import { Button, Checkbox, Divider, Input } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { GoogleButton } from "./google-button";

const linkClasses =
  "text-primary text-sm font-medium underline-offset-2 hover:underline";

export interface StepAccountDetailsProps {
  onContinueWithGoogle: () => void;
}

export function StepAccountDetails({
  onContinueWithGoogle,
}: StepAccountDetailsProps) {
  return (
    <>
      <form action="/verify-otp" method="GET" className="flex flex-col gap-4">
        <FormField label="Full Name" htmlFor="name">
          <Input id="name" placeholder="John Doe" />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <Input id="email" type="email" placeholder="you@example.com" />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
          />
        </FormField>

        <Checkbox
          id="terms"
          label="I agree to the Terms of Service and Privacy Policy"
        />

        <Button type="submit" variant="primary" className="w-full">
          Continue to Verify Email
        </Button>

        <div className="flex items-center gap-3">
          <Divider />
          <span className="text-small text-text-secondary">or</span>
          <Divider />
        </div>

        <GoogleButton onClick={onContinueWithGoogle} />
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        Already have an account?{" "}
        <NextLink  href="/sign-in" className={linkClasses}>
          Sign in
        </NextLink>
      </p>
    </>
  );
}
