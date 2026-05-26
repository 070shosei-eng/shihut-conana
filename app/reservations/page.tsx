'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import AuthGuard from '@/components/auth-guard';
import MobileShell from '@/components/mobile-shell';
import ReservationList from '@/components/reservation-list';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/app/providers';
import { deleteReservationById, saveReservation } from '@/lib/firestore';
import type { CourseType, Reservation } from '@/types';

const initialForm = { date: '', time: '18:00', name: '', partySize: 2, course: '一般' as CourseType, notes: '' };

export default function ReservationPage() {
  const { profile } = useAuth();
  const [month] = useState(new Date());
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const { reservations, refresh, loading } = useDashboardData(month);
  const isManager = profile?.role === 'manager';

  const sortedReservations = useMemo(
    () => [...reservations].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [reservations]
  );

  const submit = async () => {
    if (!profile) return;
    try {
      await saveReservation({
        id: editing?.id,
        date: form.date,
        time: form.time,
        name: form.name,
        partySize: form.partySize,
        course: form.course,
        notes: form.notes,
        createdBy: profile.displayName
      });
      toast.success(editing ? '予約を更新しました' : '予約を追加しました');
      setForm(initialForm);
      setEditing(null);
      await refresh();
    } catch (error) {
      toast.error('予約保存に失敗しました');
    }
  };

  const editReservation = (reservation: Reservation) => {
    setEditing(reservation);
    setForm({
      date: reservation.date,
      time: reservation.time,
      name: reservation.name,
      partySize: reservation.partySize,
      course: reservation.course,
      notes: reservation.notes ?? ''
    });
  };

  const removeReservation = async (reservationId: string) => {
    await deleteReservationById(reservationId);
    toast.success('予約を削除しました');
    await refresh();
  };

  return (
    <AuthGuard>
      <MobileShell title="予約" subtitle="日別予約を確認。店長は追加・編集・削除ができます。">
        {isManager ? (
          <section className="rounded-[24px] bg-white p-4 shadow-card">
            <h2 className="mb-3 text-base font-semibold">{editing ? '予約編集' : '予約追加'}</h2>
            <div className="space-y-3">
              <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} />
                <input type="number" min={1} value={form.partySize} onChange={(e) => setForm((prev) => ({ ...prev, partySize: Number(e.target.value) }))} />
              </div>
              <input placeholder="予約名" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              <select value={form.course} onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value as CourseType }))}>
                <option value="宴会">宴会</option>
                <option value="貸切">貸切</option>
                <option value="一般">一般</option>
              </select>
              <textarea rows={3} placeholder="備考" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={submit} className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">{editing ? '更新' : '追加'}</button>
                <button onClick={() => { setEditing(null); setForm(initialForm); }} className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold">クリア</button>
              </div>
            </div>
          </section>
        ) : null}

        <section>
          {loading ? (
            <div className="rounded-[24px] bg-white p-6 text-center text-sm text-muted shadow-card">読み込み中...</div>
          ) : (
            <ReservationList reservations={sortedReservations} editable={isManager} onEdit={editReservation} onDelete={removeReservation} />
          )}
        </section>
      </MobileShell>
    </AuthGuard>
  );
}
