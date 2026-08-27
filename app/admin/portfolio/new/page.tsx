import { PortfolioCategoryForm } from '@/components/admin/portfolio-category-form'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default function NewPortfolioCategoryPage() {
    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Portfolio', href: '/admin/portfolio' }, { label: 'New' }]}
                title="New Portfolio Category"
                description="Create a gallery category for your event portfolio."
            />
            <PortfolioCategoryForm />
        </AdminPage>
    )
}
