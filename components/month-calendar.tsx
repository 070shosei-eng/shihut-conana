'use client';

import { ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { addMonths, isSameMonth, parseISO, subMonths } from 'date-fns';
import { formatMonthLabel, getMonthDays, jpWeekdays } from '@/lib/date';
import type { Reservation, Shift } from '@/types';

export default function MonthCalendar({
  month,
  shifts,
  reservations,
  onPrev,
  onNext,
  onSelectDate
}: {
  month: Date;
  shifts: Shift[];
  reservations: Reservation[];
  onPrev: () => void;
  onNext: () => void;
  onSelectDate: (date: string) => void;
}) {
  const days = getMonthDays(month);

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onPrev} className="rounded-2xl border border-line p-3 text-ink">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold">{formatMonthLabel(month)}</h2>
        <button onClick={onNext} className="rounded-2xl border border-line p-3 text-ink">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
        {jpWeekdays.map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayShifts = shifts.filter((item) => item.date === day.key);
          const dayReservations = reservations.filter((item) => item.date === day.key);
          return (
            <button
              key={day.key}
              onClick={() => onSelectDate(day.key)}
              className={`min-h-[94px] rounded-2xl border p-2 text-left transition ${
                day.inMonth ? 'border-line bg-slate-50/70' : 'border-transparent bg-slate-100/40 text-slate-400'
              } ${day.isToday ? 'ring-2 ring-primary/30' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-xs font-semibold ${day.isToday ? 'text-primary' : ''}`}>{parseISO(day.key).getDate()}</span>
                {dayReservations.length > 0 ? <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">予{dayReservations.length}</span> : null}
              </div>
              <div className="space-y-1">
                {dayShifts.slice(0, 3).map((shift) => (
                  <div
                    key={shift.id}
                    className="truncate rounded-xl px-2 py-1 text-[10px] font-medium text-white"
                    style={{ backgroundColor: shift.color }}
                  >
                    {shift.staffName} {shift.startTime}
                  </div>
                ))}
                {dayShifts.length > 3 ? (
                  <div className="flex items-center text-[10px] text-muted">
                    <Dot size={12} /> 他{dayShifts.length - 3}件
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
