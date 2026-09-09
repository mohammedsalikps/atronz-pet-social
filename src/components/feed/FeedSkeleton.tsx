import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/** Placeholder cards while the bootstrap request is in flight. */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} padded={false}>
          <div className="flex items-start gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
          </div>
          <div className="space-y-2 px-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1 border-t border-cream-200 p-1.5">
            {Array.from({ length: 4 }, (_, action) => (
              <Skeleton key={action} className="h-8 rounded-xl" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
