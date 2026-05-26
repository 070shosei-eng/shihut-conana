import { Bell, CalendarClock, Repeat2, Users } from 'lucide-react';
import { formatDateLabel } from '@/lib/date';
import type { NotificationItem, Reservation, Shift, ShiftRequest } from '@/types';

export default function HomeSummary({
  shifts,
  reservations,
  requests,
  notifications
}: {
  shifts: Shift[];
  reservations: Reservation[];
  requests: ShiftRequest[];
  notifications: NotificationItem[];
}) {
  const cards = [
    { label: '本日のシフト', value: `${shifts.length}件`, icon: CalendarClock },
    { label: '本日の予約', value: `${reservations.length}件`, icon: Users },
    { label: '交代募集中', value: `${requests.length}件`, icon: Repeat2 },
    { label: '未読通知', value: `${notifications.filter((item) => !item.read).length}件`, icon: Bell }
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[24px] bg-white p-4 shadow-card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primarySoft text-primary">
                <Icon size={18} />
              </div>
              <p className="text-xs text-muted">{card.label}</p>
              <p className="mt-1 text-xl font-semibold text-ink">{card.value}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card">
        <h2 className="mb-3 text-base font-semibold">今日のシフト</h2>
        <div className="space-y-3">
          {shifts.length === 0 ? <p className="text-sm text-muted">本日のシフトはありません。</p> : null}
          {shifts.map((shift) => (
            <div key={shift.id} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: shift.color }} />
                <div>
                  <p className="text-sm font-medium">{shift.staffName}</p>
                  <p className="text-xs text-muted">{shift.startTime} - {shift.endTime}</p>
                </div>
              </div>
              {shift.swapRequestId ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">募集中</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card">
        <h2 className="mb-3 text-base font-semibold">本日の予約</h2>
        <div className="space-y-3">
          {reservations.length === 0 ? <p className="text-sm text-muted">本日の予約はありません。</p> : null}
          {reservations.map((reservation) => (
            <div key={reservation.id} className="rounded-2xl border border-line px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{reservation.name}</p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">{reservation.course}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{reservation.time} / {reservation.partySize}名</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-card">
        <h2 className="mb-3 text-base font-semibold">交代募集中</h2>
        <div className="space-y-3">
          {requests.length === 0 ? <p className="text-sm text-muted">募集中の交代申請はありません。</p> : null}
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-line px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{request.requestedByName}</p>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">募集中</span>
              </div>
              <p className="mt-1 text-sm text-muted">{formatDateLabel(request.date)}</p>
              <p className="mt-1 text-sm text-ink">{request.message}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
