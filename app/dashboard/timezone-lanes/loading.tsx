import { DashboardSidebar } from '../components/DashboardSidebar';

const loadingUsers = [
  { id: 'loading-unassigned', email: 'Unassigned', timezone: null },
  { id: 'loading-1', email: 'Loading teammate', timezone: 'UTC' },
  { id: 'loading-2', email: 'Loading teammate', timezone: 'UTC' },
  { id: 'loading-3', email: 'Loading teammate', timezone: 'UTC' },
];

function LaneSkeleton() {
  return (
    <div className="flex-shrink-0 w-80 min-w-[280px] sm:w-80 rounded-xl border bg-card/80 shadow-sm">
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="min-h-[220px] space-y-3 rounded-md">
          <div className="h-24 rounded-lg border border-dashed bg-muted/20 animate-pulse" />
          <div className="h-24 rounded-lg border border-dashed bg-muted/20 animate-pulse" />
          <div className="h-24 rounded-lg border border-dashed bg-muted/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function TimezoneBoardSkeleton(_props: { activeView?: string } = {}) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4">
        <div className="h-7 w-48 rounded-md bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded-md bg-muted animate-pulse" />
      </div>

      <div className="flex-1 overflow-hidden px-4 py-4">
        <div className="flex gap-4 overflow-x-auto h-full">
          <LaneSkeleton />
          {loadingUsers.slice(1).map((user) => (
            <LaneSkeleton key={user.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <DashboardSidebar users={loadingUsers as { id: string; email: string }[]} userEmail="Loading...">
      <TimezoneBoardSkeleton />
    </DashboardSidebar>
  );
}
