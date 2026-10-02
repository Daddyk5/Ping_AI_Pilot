import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Feedback";

/** Instant placeholder shown by route-level loading.tsx files while server data loads. */
export function PageSkeleton({ tiles = 4, wide = true }: { tiles?: number; wide?: boolean }) {
  return (
    <div className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 ${wide ? "max-w-7xl" : "max-w-5xl"}`} aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      {tiles > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: tiles }, (_, index) => (
            <Card key={index} className="p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-16" />
            </Card>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-5 h-56" />
        </Card>
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </Card>
      </div>
    </div>
  );
}
