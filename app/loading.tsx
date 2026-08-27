import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoading() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="relative h-[100vh] w-full overflow-hidden bg-[var(--ink,#121110)]">
        <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
          <Skeleton className="mb-6 h-4 w-40 rounded-full bg-white/10" />
          <Skeleton className="mb-8 h-16 w-3/4 max-w-3xl rounded-xl bg-white/10" />
          <Skeleton className="mb-12 h-6 w-1/2 max-w-xl rounded-lg bg-white/5" />
          <div className="flex gap-4">
            <Skeleton className="h-14 w-40 rounded-full bg-white/10" />
            <Skeleton className="h-14 w-40 rounded-full bg-white/5" />
          </div>
        </div>
      </section>
    </main>
  )
}
