import { CategoryForm } from '@/components/admin/category-form'

export default function NewCategoryPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">New Category</h1>
            <CategoryForm />
        </div>
    )
}
