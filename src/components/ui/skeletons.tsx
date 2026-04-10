export function StatCardSkeleton() {
  return (
    <div className="bg-[#111] border border-[#27272a] rounded-xl p-5 animate-pulse min-h-[120px]">
      <div className="h-4 w-24 bg-[#27272a] rounded mb-3"/>
      <div className="h-8 w-16 bg-[#27272a] rounded mb-2"/>
      <div className="h-3 w-32 bg-[#27272a] rounded"/>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[#27272a] animate-pulse">
      <div className="h-9 w-9 bg-[#27272a] rounded-full flex-shrink-0"/>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-[#27272a] rounded"/>
        <div className="h-3 w-24 bg-[#27272a] rounded"/>
      </div>
      <div className="h-6 w-16 bg-[#27272a] rounded-full"/>
    </div>
  )
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="bg-[#111] border border-[#27272a] rounded-xl overflow-hidden">
        {[...Array(rows)].map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
