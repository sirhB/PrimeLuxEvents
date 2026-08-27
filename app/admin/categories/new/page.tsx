import { CategoryForm } from '@/components/admin/category-form'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default function NewCategoryPage() {
    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Categories', href: '/admin/categories' }, { label: 'New' }]}
                title="New Category"
                description="Create a category to organize your product catalog."
            />
            <CategoryForm />
        </AdminPage>
    )
}
