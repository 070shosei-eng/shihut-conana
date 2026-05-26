import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
export const formatMonthLabel = (date: Date) => format(date, 'yyyy年M月', { locale: ja });
export const formatDateLabel = (dateKey: string) => format(parseISO(dateKey), 'M月d日(E)', { locale: ja });
export const todayKey = () => formatDateKey(new Date());

export const getMonthDays = (currentMonth: Date) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = addDays(startOfWeek(addDays(monthEnd, 7), { weekStartsOn: 0 }), 6);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((date) => ({
    date,
    key: formatDateKey(date),
    inMonth: date.getMonth() === currentMonth.getMonth(),
    isToday: isSameDay(date, new Date())
  }));
};

export const jpWeekdays = ['日', '月', '火', '水', '木', '金', '土'];
