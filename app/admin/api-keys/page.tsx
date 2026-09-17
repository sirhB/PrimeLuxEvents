import { requirePermission } from '@/lib/auth/authorization'
import { listApiKeys } from '@/app/actions/api-keys'
import { ApiKeysAdminContent } from '@/components/admin/api-keys/api-keys-content'

export default async function AdminApiKeysPage() {
  await requirePermission('settings.view')
  const { keys, error } = await listApiKeys()

  return <ApiKeysAdminContent keys={keys} loadError={error} />
}
