import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="flex w-full max-w-[1600px] flex-col gap-6">
      <div className="space-y-2 border-b border-[var(--dashboard-border)] pb-5">
        <Skeleton className="h-3 w-16 bg-white/10" />
        <Skeleton className="h-8 w-48 bg-white/10" />
        <Skeleton className="h-4 w-72 bg-white/5" />
      </div>
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-[var(--dashboard-radius)] bg-white/5" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-[var(--dashboard-radius)] bg-white/5" />
    </div>
  )
}
