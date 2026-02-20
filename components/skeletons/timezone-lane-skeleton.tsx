/**
 * TimezoneLaneSkeleton Component
 *
 * Loading skeleton for timezone lanes page.
 * Shows placeholder cards while data is loading.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function TimezoneLaneSkeleton() {
  return (
    <Card className="flex-shrink-0 w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              <Skeleton className="h-full w-full" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TimezoneLanesSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <TimezoneLaneSkeleton key={i} />
      ))}
    </div>
  );
}
