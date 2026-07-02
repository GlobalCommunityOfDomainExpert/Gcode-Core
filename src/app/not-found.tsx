import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-4">
        <p className="text-display text-primary text-center font-extrabold">
          404
        </p>
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="The page you're looking for doesn't exist or may have moved."
          action={
            <ButtonLink href="/events" variant="primary">
              Browse Events
            </ButtonLink>
          }
        />
      </div>
    </main>
  );
}
