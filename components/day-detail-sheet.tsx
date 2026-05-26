'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatDateLabel, jpWeekdays } from '@/lib/date';
import {
  acceptShiftRequest,
  createShiftRequest,
  deleteReservationById,
  deleteShiftById,
  saveReservation,
  saveShift
} from '@/lib/firestore';
import SwapRequestCard from '@/components/swap-request-card';
import type { AppUser, CourseType, Reservation, Shift, ShiftRequest } from '@/types';

const defaultShift = { staffId: '', startTime: '10:00', endTime: '15:00' };
const defaultReservation = { name: '', time: '18:00', partySize: 2, course: '一般' as CourseType, notes: '' };

export default function DayDetailSheet({
  open,
  date,
  shifts,
  reservations,
  requests,
  users,
  currentUser,
  onClose,
  onSaved
}: {
  open: boolean;
  date: string;
  shifts: Shift[];
  reservations: Reservation[];
  requests: ShiftRequest[];
  users: AppUser[];
  currentUser: AppUser;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [shiftForm, setShiftForm] = useState(defaultShift);
  const [reservationForm, setReservationForm] = useState(defaultReservation);
  const [saving, setSaving] = useState(false);

  const managers = useMemo(() => users.filter((item) => item.role === 'manager'), [users]);
  const isManager = currentUser.role === 'manager';
  const ownShifts = shifts.filter((item) => item.staffId === currentUser.id);

  if (!open) return null;

  const submitShift = async () => {
    if (!shiftForm.staffId) return toast.error('スタッフを選択してください');
    const user = users.find((item) => item.id === shiftForm.staffId);
    if (!user) return toast.error('スタッフ情報が見つかりません');

    try {
      setSaving(true);
      await saveShift({
        date,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        staffId: user.id,
        staffName: user.displayName,
        color: user.color,
        createdBy: currentUser.displayName,
        history: []
      });
      toast.success('シフトを保存しました');
      setShiftForm(defaultShift);
      await onSaved();
    } catch (error) {
      toast.error('シフト保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const submitReservation = async () => {
    try {
      setSaving(true);
      await saveReservation({ ...reservationForm, date, createdBy: currentUser.displayName });
      toast.success('予約を保存しました');
      setReservationForm(defaultReservation);
      await onSaved();
    } catch (error) {
      toast.error('予約保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const createRequest = async (shift: Shift) => {
    try {
      setSaving(true);
      await createShiftRequest(shift, `${formatDateLabel(date)} のシフト代われる人募集`, managers);
      toast.success('交代募集を開始しました');
      await onSaved();
    } catch (error) {
      toast.error('交代募集に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const acceptRequest = async (request: ShiftRequest) => {
    try {
      setSaving(true);
      await acceptShiftRequest(request, currentUser);
      toast.success('シフト交代が完了しました');
      await onSaved();
    } catch (error) {
      toast.error('交代承認に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40">
      <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] max-w-md overflow-y-auto rounded-t-[32px] bg-white p-4 shadow-sheet">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-200" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Day detail</p>
            <h2 className="mt-1 text-xl font-bold">{formatDateLabel(date)}</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold">閉じる</button>
        </div>

        <div className="space-y-4">
          <section className="rounded-[24px] bg-slate-50 p-4">
            <h3 className="mb-3 text-base font-semibold">シフト</h3>
            <div className="space-y-3">
              {shifts.length === 0 ? <p className="text-sm text-muted">登録されたシフトはありません。</p> : null}
              {shifts.map((shift) => (
                <div key={shift.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: shift.color }} />
                      <div>
                        <p className="font-medium">{shift.staffName}</p>
                        <p className="text-sm text-muted">{shift.startTime} - {shift.endTime}</p>
                      </div>
                    </div>
                    {isManager ? (
                      <button
                        onClick={async () => {
                          await deleteShiftById(shift.id);
                          toast.success('シフトを削除しました');
                          await onSaved();
                        }}
                        className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white"
                      >
                        削除
                      </button>
                    ) : null}
                  </div>
                  {!isManager && ownShifts.some((item) => item.id === shift.id) && !shift.swapRequestId ? (
                    <button onClick={() => createRequest(shift)} className="mt-3 w-full rounded-2xl border border-primary bg-primarySoft px-4 py-3 text-sm font-semibold text-primary">
                      交代募集を出す
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            {isManager ? (
              <div className="mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                <h4 className="font-semibold">シフト追加</h4>
                <select value={shiftForm.staffId} onChange={(e) => setShiftForm((prev) => ({ ...prev, staffId: e.target.value }))}>
                  <option value="">スタッフ選択</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.displayName}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm((prev) => ({ ...prev, startTime: e.target.value }))} />
                  <input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm((prev) => ({ ...prev, endTime: e.target.value }))} />
                </div>
                <button onClick={submitShift} disabled={saving} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">シフト保存</button>
              </div>
            ) : null}
          </section>

          <section className="rounded-[24px] bg-slate-50 p-4">
            <h3 className="mb-3 text-base font-semibold">予約</h3>
            <div className="space-y-3">
              {reservations.length === 0 ? <p className="text-sm text-muted">予約はありません。</p> : null}
              {reservations.map((reservation) => (
                <div key={reservation.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{reservation.name}</p>
                      <p className="mt-1 text-sm text-muted">{reservation.time} / {reservation.partySize}名</p>
                      <p className="mt-1 text-xs text-slate-600">{reservation.course} {reservation.notes ? `・${reservation.notes}` : ''}</p>
                    </div>
                    {isManager ? (
                      <button
                        onClick={async () => {
                          await deleteReservationById(reservation.id);
                          toast.success('予約を削除しました');
                          await onSaved();
                        }}
                        className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white"
                      >
                        削除
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {isManager ? (
              <div className="mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                <h4 className="font-semibold">予約追加</h4>
                <input placeholder="予約名" value={reservationForm.name} onChange={(e) => setReservationForm((prev) => ({ ...prev, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="time" value={reservationForm.time} onChange={(e) => setReservationForm((prev) => ({ ...prev, time: e.target.value }))} />
                  <input type="number" min={1} value={reservationForm.partySize} onChange={(e) => setReservationForm((prev) => ({ ...prev, partySize: Number(e.target.value) }))} />
                </div>
                <select value={reservationForm.course} onChange={(e) => setReservationForm((prev) => ({ ...prev, course: e.target.value as CourseType }))}>
                  <option value="宴会">宴会</option>
                  <option value="貸切">貸切</option>
                  <option value="一般">一般</option>
                </select>
                <textarea rows={3} placeholder="備考" value={reservationForm.notes} onChange={(e) => setReservationForm((prev) => ({ ...prev, notes: e.target.value }))} />
                <button onClick={submitReservation} disabled={saving} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">予約保存</button>
              </div>
            ) : null}
          </section>

          <section className="rounded-[24px] bg-slate-50 p-4">
            <h3 className="mb-3 text-base font-semibold">交代募集</h3>
            <div className="space-y-3">
              {requests.length === 0 ? <p className="text-sm text-muted">この日の交代申請はありません。</p> : null}
              {requests.map((request) => (
                <SwapRequestCard
                  key={request.id}
                  request={request}
                  canAccept={request.status === 'open' && request.requestedById !== currentUser.id}
                  onAccept={() => acceptRequest(request)}
                />
              ))}
            </div>
          </section>

          {isManager ? (
            <section className="rounded-[24px] bg-slate-50 p-4 text-sm text-muted">
              <p>曜日固定シフトは「管理」タブから編集できます。曜日ごとの固定シフトは毎月自動反映されます。</p>
              <p className="mt-2">曜日番号: {jpWeekdays.map((label, index) => `${index}=${label}`).join(' / ')}</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
