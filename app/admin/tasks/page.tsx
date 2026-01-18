import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'

const TasksContent = dynamic(
    () => import('@/components/admin/tasks/tasks-content').then(mod => mod.TasksContent)
)

export default async function TasksPage() {
    const supabase = await createClient()

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user roles to filter tasks assigned to roles
    const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user?.id)

    const roleIds = userRoles?.map(r => r.role_id) || []

    return (
        <div className="p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <TasksContent tasks={tasks} user={user} roleIds={roleIds} />
        </div>
    )
}
