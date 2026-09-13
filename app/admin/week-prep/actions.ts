'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateWarehouseTasksForDeliveryDateRange } from '@/lib/warehouse/task-generator'
import {
  fetchWeekPrepCohort,
  type WeekPrepOrderRow,
  type WeekPrepSummary,
} from '@/lib/warehouse/week-prep'
import {
  getUpcomingWeekendWindow,
  shiftWeekendWindow,
  type WeekendWindow,
} from '@/lib/warehouse/weekend'

export type WeekPrepPageData = {
  window: WeekendWindow
  rows: WeekPrepOrderRow[]
  summary: WeekPrepSummary
}

export async function loadWeekPrepData(offsetWeeks = 0): Promise<WeekPrepPageData> {
  const supabase = await createClient()
  const window = shiftWeekendWindow(getUpcomingWeekendWindow(), offsetWeeks)
  const { rows, summary } = await fetchWeekPrepCohort(supabase, window)
  return { window, rows, summary }
}

export async function generateTasksForWeekendWindow(start: string, end: string) {
  const supabase = await createClient()
  const result = await generateWarehouseTasksForDeliveryDateRange(supabase, start, end)
  revalidatePath('/admin/week-prep')
  revalidatePath('/admin/warehouse/schedule')
  revalidatePath('/admin')
  return result
}
