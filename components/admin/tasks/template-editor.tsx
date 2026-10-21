'use client'

import { useState } from 'react'
import { PIPELINE_STAGES, type DeskWorkspace, type PipelineStage, type TaskTemplate } from '@/lib/venues/desk'
import { useDesk } from '@/components/admin/venue/use-desk'

export function TemplateEditor({ initial, live = false }: { initial: DeskWorkspace; live?: boolean }) {
  const api = useDesk(initial, live)
  const [selected, setSelected] = useState(api.desk.templates[0]?.id || '')
  const template = api.desk.templates.find((item) => item.id === selected) || api.desk.templates[0]

  function patch(next: TaskTemplate) {
    api.saveTemplates(api.desk.templates.map((item) => item.id === next.id ? next : item))
  }

  if (!template) return <p>No templates yet.</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="space-y-2">
        {api.desk.templates.map((item) => (
          <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={`block w-full border px-3 py-3 text-left ${item.id === template.id ? 'border-[var(--theme-dark)] bg-white' : 'border-[var(--dashboard-border)] bg-white'}`}>
            <span className="block font-medium">{item.name}</span>
            <span className="text-xs font-medium text-[var(--dashboard-text-muted)]">{item.trigger_stage} · {item.active ? 'active' : 'off'}</span>
          </button>
        ))}
        <button
          type="button"
          className="lux-cta-ghost w-full !min-h-10"
          onClick={() => {
            const created: TaskTemplate = { id: `tpl-${Date.now()}`, name: 'New template', trigger_stage: 'proposal', active: true, items: [] }
            api.saveTemplates([...api.desk.templates, created])
            setSelected(created.id)
          }}
        >
          New template
        </button>
      </aside>
      <section className="border border-[var(--dashboard-border)] bg-white p-4 md:p-6">
        <label className="block text-xs font-medium">
          Name
          <input className="plan-field" value={template.name} onChange={(event) => patch({ ...template, name: event.target.value })} />
        </label>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium">
            When the stage becomes
            <select className="plan-field" value={template.trigger_stage} onChange={(event) => patch({ ...template, trigger_stage: event.target.value as PipelineStage })}>
              {PIPELINE_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 self-end text-sm">
            <input type="checkbox" checked={template.active} onChange={(event) => patch({ ...template, active: event.target.checked })} />
            Active
          </label>
        </div>
        <ul className="mt-6 space-y-4">
          {template.items.map((item, index) => (
            <li key={item.key} className="border-t border-[var(--dashboard-border)] pt-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem_8rem]">
                <label className="text-xs font-medium">
                  Task
                  <input className="plan-field" value={item.title} onChange={(event) => {
                    const items = template.items.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row)
                    patch({ ...template, items })
                  }} />
                </label>
                <label className="text-xs font-medium">
                  Days from event
                  <input type="number" className="plan-field" value={item.offset_days} onChange={(event) => {
                    const items = template.items.map((row, rowIndex) => rowIndex === index ? { ...row, offset_days: Number(event.target.value) } : row)
                    patch({ ...template, items })
                  }} />
                </label>
                <label className="text-xs font-medium">
                  Priority
                  <select className="plan-field" value={item.priority} onChange={(event) => {
                    const items = template.items.map((row, rowIndex) => rowIndex === index ? { ...row, priority: event.target.value as TaskTemplate['items'][number]['priority'] } : row)
                    patch({ ...template, items })
                  }}>
                    {['low', 'medium', 'high', 'urgent'].map((priority) => <option key={priority}>{priority}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-xs font-medium">
                Checklist, one line each
                <textarea
                  className="plan-field min-h-20"
                  value={item.checklist.join('\n')}
                  onChange={(event) => {
                    const items = template.items.map((row, rowIndex) => rowIndex === index ? { ...row, checklist: event.target.value.split('\n') } : row)
                    patch({ ...template, items })
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="lux-cta-ghost !min-h-10"
            onClick={() => patch({
              ...template,
              items: [...template.items, { key: `item-${Date.now()}`, title: 'New task', offset_days: 0, priority: 'medium', checklist: ['First step'] }],
            })}
          >
            Add task
          </button>
          <button type="button" className="lux-cta !min-h-10" onClick={() => api.saveTemplates(api.desk.templates, true)}>Save templates</button>
        </div>
        {api.message && <p className="mt-3 text-sm text-[var(--dashboard-text-muted)]">{api.message}</p>}
      </section>
    </div>
  )
}
