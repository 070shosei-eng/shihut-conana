'use client';

import AuthGuard from '@/components/auth-guard';
import MobileShell from '@/components/mobile-shell';
import { useAuth } from '@/app/providers';
import { logout } from '@/lib/auth';
import { disablePushNotifications, enablePushNotifications } from '@/lib/notifications';
import { markNotificationAsRead } from '@/lib/firestore';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function SettingsPage() {
  const { profile } = useAuth();
  const { notifications, refresh } = useDashboardData(new Date());

  return (
    <AuthGuard>
      <MobileShell title="設定" subtitle="プロフィール確認、通知設定、ログアウト。">
        {profile ? (
          <>
            <section className="rounded-[24px] bg-white p-4 shadow-card">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-2xl" style={{ backgroundColor: profile.color }} />
                <div>
                  <h2 className="text-lg font-semibold">{profile.displayName}</h2>
                  <p className="text-sm text-muted">{profile.email}</p>
                  <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">{profile.role === 'manager' ? '店長' : 'スタッフ'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] bg-white p-4 shadow-card">
              <h2 className="mb-3 text-base font-semibold">通知</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => enablePushNotifications(profile.id, profile.pushTokens)} className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">Pushを有効化</button>
                <button onClick={() => disablePushNotifications(profile.id)} className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold">Pushを無効化</button>
              </div>
              <div className="mt-4 space-y-3">
                {notifications.length === 0 ? <p className="text-sm text-muted">通知はありません。</p> : null}
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={async () => {
                      if (!item.read) await markNotificationAsRead(item.id);
                      await refresh();
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left ${item.read ? 'border-line bg-slate-50' : 'border-primary/20 bg-primarySoft'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{item.title}</p>
                      {!item.read ? <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-white">未読</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                  </button>
                ))}
              </div>
            </section>

            <button onClick={() => logout()} className="w-full rounded-[24px] bg-slate-900 px-4 py-4 text-sm font-semibold text-white shadow-card">ログアウト</button>
          </>
        ) : null}
      </MobileShell>
    </AuthGuard>
  );
}
