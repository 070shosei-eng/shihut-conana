'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createStaffInvite, updateUserProfile } from '@/lib/firestore';
import { jpWeekdays } from '@/lib/date';
import type { AppUser, WeeklyShift } from '@/types';

const inviteInitial = { displayName: '', email: '', color: '#2563eb' };
const weeklyInitial = { weekday: 1, startTime: '10:00', endTime: '15:00' };

export default function ManagerPanel({ users, onSaved }: { users: AppUser[]; onSaved: () => Promise<void> }) {
  const [invite, setInvite] = useState(inviteInitial);
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '');
  const [weeklyForm, setWeeklyForm] = useState(weeklyInitial);
  const selectedUser = useMemo(() => users.find((item) => item.id === selectedUserId) ?? users[0], [selectedUserId, users]);

  const addInvite = async () => {
    if (!invite.displayName || !invite.email) return toast.error('氏名とメールを入力してください');
    await createStaffInvite({ ...invite, role: 'staff' });
    toast.success('スタッフ招待を登録しました。対象スタッフは同じメールで新規登録してください。');
    setInvite(inviteInitial);
  };

  const updateColor = async (userId: string, color: string) => {
    await updateUserProfile(userId, { color });
    toast.success('スタッフカラーを更新しました');
    await onSaved();
  };

  const addWeeklyShift = async () => {
    if (!selectedUser) return;
    const nextWeekly = [...(selectedUser.defaultWeeklyShifts ?? []), weeklyForm as WeeklyShift];
    await updateUserProfile(selectedUser.id, { defaultWeeklyShifts: nextWeekly });
    toast.success('曜日固定シフトを追加しました');
    setWeeklyForm(weeklyInitial);
    await onSaved();
  };

  const removeWeeklyShift = async (index: number) => {
    if (!selectedUser) return;
    const nextWeekly = [...(selectedUser.defaultWeeklyShifts ?? [])];
    nextWeekly.splice(index, 1);
    await updateUserProfile(selectedUser.id, { defaultWeeklyShifts: nextWeekly });
    toast.success('曜日固定シフトを削除しました');
    await onSaved();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-white p-4 shadow-card">
        <h2 className="mb-3 text-base font-semibold">スタッフ追加</h2>
        <div className="space-y-3">
          <input placeholder="スタッフ名" value={invite.displayName} onChange={(e) => setInvite((prev) => ({ ...prev, displayName: e.target.value }))} />
          <input type="email" placeholder="メールアドレス" value={invite.email} onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))} />
          <div className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3">
            <span className="text-sm text-muted">カラー</span>
            <input className="h-10 w-14 rounded-xl p-1" type="color" value={invite.color} onChange={(e) => setInvite((prev) => ({ ...prev, color: e.target.value }))} />
          </div>
          <button onClick={addInvite} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">スタッフ招待を作成</button>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card">
        <h2 className="mb-3 text-base font-semibold">スタッフ色変更</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
              <div>
                <p className="font-medium">{user.displayName}</p>
                <p className="text-xs text-muted">{user.role === 'manager' ? '店長' : 'スタッフ'}</p>
              </div>
              <div className="flex items-center gap-2">
                <input className="h-10 w-14 rounded-xl p-1" type="color" value={user.color} onChange={(e) => updateColor(user.id, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card">
        <h2 className="mb-3 text-base font-semibold">曜日固定シフト</h2>
        <div className="space-y-3">
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.displayName}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <select value={weeklyForm.weekday} onChange={(e) => setWeeklyForm((prev) => ({ ...prev, weekday: Number(e.target.value) }))}>
              {jpWeekdays.map((day, index) => (
                <option key={day} value={index}>{day}</option>
              ))}
            </select>
            <input type="time" value={weeklyForm.startTime} onChange={(e) => setWeeklyForm((prev) => ({ ...prev, startTime: e.target.value }))} />
            <input type="time" value={weeklyForm.endTime} onChange={(e) => setWeeklyForm((prev) => ({ ...prev, endTime: e.target.value }))} />
          </div>
          <button onClick={addWeeklyShift} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">曜日固定シフト追加</button>

          <div className="space-y-2">
            {(selectedUser?.defaultWeeklyShifts ?? []).length === 0 ? <p className="text-sm text-muted">固定シフトは未設定です。</p> : null}
            {(selectedUser?.defaultWeeklyShifts ?? []).map((shift, index) => (
              <div key={`${shift.weekday}-${shift.startTime}-${index}`} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
                <p className="text-sm font-medium">毎週 {jpWeekdays[shift.weekday]} {shift.startTime} - {shift.endTime}</p>
                <button onClick={() => removeWeeklyShift(index)} className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white">削除</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
