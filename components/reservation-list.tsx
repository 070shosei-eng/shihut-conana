'use client';

import type { Reservation } from '@/types';

export default function ReservationList({
  reservations,
  editable,
  onEdit,
  onDelete
}: {
  reservations: Reservation[];
  editable?: boolean;
  onEdit?: (reservation: Reservation) => void;
  onDelete?: (reservationId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {reservations.length === 0 ? <p className="text-sm text-muted">予約はありません。</p> : null}
      {reservations.map((reservation) => (
        <div key={reservation.id} className="rounded-[24px] bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-ink">{reservation.name}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">{reservation.course}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{reservation.date} / {reservation.time}</p>
              <p className="mt-1 text-sm text-ink">{reservation.partySize}名 {reservation.notes ? `・${reservation.notes}` : ''}</p>
            </div>
            {editable ? (
              <div className="flex gap-2">
                <button onClick={() => onEdit?.(reservation)} className="rounded-2xl border border-line px-3 py-2 text-xs font-semibold">編集</button>
                <button onClick={() => onDelete?.(reservation.id)} className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white">削除</button>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
