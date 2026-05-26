'use client';

import AuthGuard from '@/components/auth-guard';
import ManagerPanel from '@/components/manager-panel';
import MobileShell from '@/components/mobile-shell';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/app/providers';

export default function AdminPage() {
  const { profile } = useAuth();
  const { users, refresh, loading } = useDashboardData(new Date());

  return (
    <AuthGuard>
      <MobileShell title="管理" subtitle="スタッフ追加・色設定・曜日固定シフト編集。">
        {profile?.role !== 'manager' ? (
          <div className="rounded-[24px] bg-white p-6 text-center text-sm text-muted shadow-card">店長のみアクセスできます。</div>
        ) : loading ? (
          <div className="rounded-[24px] bg-white p-6 text-center text-sm text-muted shadow-card">読み込み中...</div>
        ) : (
          <ManagerPanel users={users} onSaved={refresh} />
        )}
      </MobileShell>
    </AuthGuard>
  );
}
