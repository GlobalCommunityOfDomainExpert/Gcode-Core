import { Skeleton } from "@/components/atoms";

// Mirrors the real page's layout (breadcrumb, hero, main-column cards,
// sidebar cards) so the loading state doesn't jump once the event arrives.
export function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Skeleton className="aspect-3/1 w-full rounded-md" />

          <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
