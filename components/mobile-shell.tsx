import BottomTabBar from '@/components/bottom-tab-bar';

export default function MobileShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-5 safe-bottom">
      <header className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Restaurant Shift</p>
        <div className="rounded-[28px] bg-white/90 p-4 shadow-card ring-1 ring-white">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
      <BottomTabBar />
    </main>
  );
}
