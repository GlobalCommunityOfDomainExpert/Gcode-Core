import { Suspense } from "react";
import { SignUpFlow } from "../_components/sign-up-flow";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpFlow />
    </Suspense>
  );
}
