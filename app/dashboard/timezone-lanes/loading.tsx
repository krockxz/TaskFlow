import { TimezoneLanesSkeletonGrid } from '@/components/skeletons/timezone-lane-skeleton';

export default function Loading() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4">
        <div className="h-7 w-48 rounded-md bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="flex-1 overflow-hidden py-4">
        <TimezoneLanesSkeletonGrid count={4} />
      </div>
    </div>
  );
}
