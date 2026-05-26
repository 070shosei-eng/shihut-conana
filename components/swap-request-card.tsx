'use client';

import { CheckCircle2, Repeat2 } from 'lucide-react';
import { formatDateLabel } from '@/lib/date';
import type { ShiftRequest } from '@/types';

export default function SwapRequestCard({
  request,
  canAccept,
  onAccept
}: {
  request: ShiftRequest;
  canAccept: boolean;
  onAccept?: () => void;
}) {
  const completed = request.status === 'completed';

  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{request.requestedByName}</p>
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {completed ? '交代完了' : '募集中'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{formatDateLabel(request.date)}</p>
          <p className="mt-1 text-sm text-ink">{request.message}</p>
          {completed && request.acceptedByName ? <p className="mt-1 text-xs text-emerald-700">担当: {request.acceptedByName}</p> : null}
        </div>
        {completed ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Repeat2 size={20} className="text-amber-600" />}
      </div>
      {!completed && canAccept ? (
        <button onClick={onAccept} className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">
          代われます
        </button>
      ) : null}
    </div>
  );
}
