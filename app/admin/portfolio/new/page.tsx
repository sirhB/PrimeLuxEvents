import { PortfolioCategoryForm } from '@/components/admin/portfolio-category-form'

export default function NewPortfolioCategoryPage() {
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <PortfolioCategoryForm />
        </div>
    )
}
