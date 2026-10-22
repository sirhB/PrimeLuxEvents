/** Planner pages inside the client account portal (no staff-portal permission needed). */
export function PlannerShell({ title, lede, children }: { title: string; lede?: string; children: React.ReactNode }) {
  return (
    <div className="admin-theme mx-auto flex max-w-3xl flex-col gap-5 text-[var(--dashboard-text)]">
      <header>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">Planner</p>
        <h1 className="font-serif text-4xl leading-tight">{title}</h1>
        {lede && <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{lede}</p>}
      </header>
      {children}
    </div>
  )
}
