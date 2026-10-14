'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ClientChange } from '@/lib/venues/desk'

async function call(fn: string, args: Record<string, string | number | null>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sign in required')
  const { error } = await supabase.rpc(fn, args)
  if (error) throw new Error('Could not save that')
  revalidatePath('/account/event')
  revalidatePath('/admin/venue')
}

export async function persistClientChange(leadId: string, change: ClientChange) {
  if (change.type === 'details') {
    await call('client_update_details', { p_lead: leadId, p_guests: change.guest_count, p_details: change.details })
    return
  }
  if (change.type === 'message') {
    await call('client_send_message', { p_lead: leadId, p_body: change.body })
    return
  }
  if (change.type === 'document') {
    await call('client_add_document', { p_lead: leadId, p_name: change.name, p_kind: change.kind })
    return
  }
  if (change.type === 'sign') {
    await call('client_sign_contract', { p_lead: leadId, p_name: change.name })
    return
  }
  await call('client_complete_task', { p_task: change.taskId })
}
