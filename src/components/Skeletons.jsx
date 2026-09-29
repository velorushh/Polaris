import React from 'react';

/** Generic skeleton block */
export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />;
}

/** Skeleton for the inventory chart widget */
export function InventoryChartSkeleton() {
  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      {/* Chart bars */}
      <div className="flex-1 flex items-end gap-4 pt-4">
        {[68, 85, 35].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col gap-2 items-center">
            <SkeletonBlock className="w-full rounded-t" style={{ height: `${h}%` }} />
            <SkeletonBlock className="h-2 w-3/4" />
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex gap-3">
        <SkeletonBlock className="h-2 w-20" />
        <SkeletonBlock className="h-2 w-16" />
      </div>
    </div>
  );
}

/** Skeleton for the deployments list widget */
export function DeploymentsSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <SkeletonBlock className="h-3 w-40" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-800">
          <SkeletonBlock className="h-7 w-7 rounded-md flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <SkeletonBlock className="h-2.5 w-3/4" />
            <SkeletonBlock className="h-2 w-1/2" />
          </div>
          <SkeletonBlock className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the cargo timeline widget */
export function CargoSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonBlock className="h-3 w-36" />
      {/* Vessel info */}
      <div className="bg-slate-800/50 rounded-md p-3 flex gap-3">
        <SkeletonBlock className="h-8 w-8 rounded-md flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBlock className="h-3 w-40" />
          <SkeletonBlock className="h-2 w-24" />
        </div>
        <SkeletonBlock className="h-6 w-20 rounded" />
      </div>
      {/* Timeline events */}
      <div className="relative pl-4 space-y-3">
        <div className="absolute left-0 top-2 bottom-2 w-px bg-slate-700" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <SkeletonBlock className="h-3 w-3 rounded-full flex-shrink-0 -ml-1.5 mt-0.5 border border-slate-950" />
            <div className="flex-1 flex flex-col gap-1">
              <SkeletonBlock className="h-2.5 w-3/4" />
              <SkeletonBlock className="h-2 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for map placeholder */
export function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-md">
      <div className="flex flex-col items-center gap-3">
        <div className="skeleton-shimmer h-4 w-64 rounded" />
        <div className="skeleton-shimmer h-3 w-40 rounded" />
      </div>
    </div>
  );
}
