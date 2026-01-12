import { Skeleton } from "@/components/ui/skeleton"

export default function CatalogLoading() {
    return (
        <main className="min-h-screen bg-[#1A1A1A]">
            {/* Hero Skeleton */}
            <div className="relative h-[60vh] md:h-[70vh] bg-black w-full overflow-hidden">
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
                <div className="relative container mx-auto h-full flex flex-col justify-center items-center px-4 z-10 space-y-8">
                    <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
                    <Skeleton className="h-20 w-3/4 max-w-2xl rounded-xl bg-white/10" />
                    <Skeleton className="h-6 w-1/2 max-w-xl rounded-lg bg-white/5" />
                </div>
            </div>

            {/* Sticky Bar Skeleton */}
            <div className="sticky top-[72px] z-40 bg-[#1A1A1A]/80 backdrop-blur-xl border-y border-white/5 py-6">
                <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6 items-center">
                    <Skeleton className="h-14 w-full flex-1 rounded-full bg-white/10" />
                    <div className="flex gap-4 w-full lg:w-auto">
                        <Skeleton className="h-14 w-44 rounded-full bg-white/10" />
                        <Skeleton className="h-14 w-24 rounded-full bg-white/10" />
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="container mx-auto px-4 py-24 space-y-32">
                {/* Featured Section Skeleton */}
                <section>
                    <Skeleton className="h-4 w-40 mb-4 bg-white/10" />
                    <Skeleton className="h-16 w-96 mb-16 bg-white/10" />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-[3/4] w-full rounded-[2rem] bg-white/5" />
                                <div className="space-y-2 px-2">
                                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                                    <Skeleton className="h-4 w-1/4 bg-white/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Categories Skeleton */}
                <section>
                    <Skeleton className="h-4 w-40 mb-4 bg-white/10" />
                    <Skeleton className="h-16 w-96 mb-16 bg-white/10" />

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square w-full rounded-2xl bg-white/5" />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
