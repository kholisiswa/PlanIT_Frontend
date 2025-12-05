import { Skeleton } from "./ui/skeleton";

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="relative w-[260px] border-r border-border bg-background p-4 space-y-6">
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 select-none">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Menu items */}
        <div className="space-y-2 px-2">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* User info bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        
        {/* Page title */}
        <Skeleton className="h-8 w-56 rounded-md" />

        {/* Top cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>

        {/* Main section */}
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
