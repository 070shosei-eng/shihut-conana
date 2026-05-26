'use client';

import { useMemo } from 'react';
import AuthGuard from '@/components/auth-guard';
import HomeSummary from '@/components/home-summary';
import MobileShell from '@/components/mobile-shell';
import { todayKey } from '@/lib/date';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from './providers';

export default function HomePage() {
  const { profile } = useAuth();
  const today = todayKey();
  const { shifts, reservations, requests, notifications, loading } = useDashboardData(new Date());

  const todayShifts = useMemo(() => {
    const base = shifts.filter((item) => item.date === today);
    return profile?.role === 'manager' ? base : base.filter((item) => item.staffId === profile?.id);
  }, [profile, shifts, today]);

  const todayReservations = useMemo(() => reservations.filter((item) => item.date === today), [reservations, today]);
  const openRequests = useMemo(() => requests.filter((item) => item.status === 'open'), [requests]);

  return (
    <AuthGuard>
      <MobileShell title="ホーム" subtitle="今日のシフト・予約・交代募集をまとめて確認できます。">
        {loading || !profile ? (
          <div className="rounded-[24px] bg-white p-6 text-center text-sm text-muted shadow-card">読み込み中...</div>
        ) : (
          <HomeSummary shifts={todayShifts} reservations={todayReservations} requests={openRequests} notifications={notifications} />
        )}
      </MobileShell>
    </AuthGuard>
  );
}
