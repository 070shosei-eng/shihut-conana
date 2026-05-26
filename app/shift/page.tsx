'use client';

import { useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import AuthGuard from '@/components/auth-guard';
import DayDetailSheet from '@/components/day-detail-sheet';
import MobileShell from '@/components/mobile-shell';
import MonthCalendar from '@/components/month-calendar';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/app/providers';
import { todayKey } from '@/lib/date';

export default function ShiftPage() {
  const { profile } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [open, setOpen] = useState(false);
  const { users, shifts, reservations, requests, loading, refresh } = useDashboardData(month);

  const visibleShifts = useMemo(() => {
    if (profile?.role === 'manager') return shifts;
    return shifts.filter((item) => item.staffId === profile?.id || item.swapRequestId);
  }, [profile, shifts]);

  const selectedDayShifts = useMemo(() => visibleShifts.filter((item) => item.date === selectedDate), [selectedDate, visibleShifts]);
  const selectedDayReservations = useMemo(() => reservations.filter((item) => item.date === selectedDate), [reservations, selectedDate]);
  const selectedDayRequests = useMemo(() => requests.filter((item) => item.date === selectedDate), [requests, selectedDate]);

  return (
    <AuthGuard>
      <MobileShell title="シフト" subtitle="月間カレンダーでシフトと予約をまとめて確認できます。">
        {loading ? (
          <div className="rounded-[24px] bg-white p-6 text-center text-sm text-muted shadow-card">読み込み中...</div>
        ) : (
          <>
            <MonthCalendar
              month={month}
              shifts={visibleShifts}
              reservations={reservations}
              onPrev={() => setMonth((prev) => subMonths(prev, 1))}
              onNext={() => setMonth((prev) => addMonths(prev, 1))}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setOpen(true);
              }}
            />

            {profile ? (
              <DayDetailSheet
                open={open}
                date={selectedDate}
                shifts={selectedDayShifts}
                reservations={selectedDayReservations}
                requests={selectedDayRequests}
                users={users}
                currentUser={profile}
                onClose={() => setOpen(false)}
                onSaved={refresh}
              />
            ) : null}
          </>
        )}
      </MobileShell>
    </AuthGuard>
  );
}
