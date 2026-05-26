import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  limit
} from 'firebase/firestore';
import { addDays, endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { db } from '@/lib/firebase';
import { formatDateKey } from '@/lib/date';
import type {
  AppUser,
  NotificationItem,
  Reservation,
  Shift,
  ShiftHistory,
  ShiftRequest,
  StaffInvite,
  WeeklyShift
} from '@/types';

const usersCol = collection(db, 'users');
const shiftsCol = collection(db, 'shifts');
const reservationsCol = collection(db, 'reservations');
const shiftRequestsCol = collection(db, 'shiftRequests');
const notificationsCol = collection(db, 'notifications');
const staffInvitesCol = collection(db, 'staffInvites');

const nowIso = () => new Date().toISOString();

const toShiftHistory = (action: string, by: string): ShiftHistory => ({
  action,
  by,
  at: nowIso()
});

export const fetchUsers = async () => {
  const snap = await getDocs(query(usersCol, orderBy('displayName', 'asc')));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })) as AppUser[];
};

export const fetchMonthShifts = async (month: Date) => {
  const start = format(startOfMonth(month), 'yyyy-MM-dd');
  const end = format(endOfMonth(month), 'yyyy-MM-dd');
  const snap = await getDocs(query(shiftsCol, where('date', '>=', start), where('date', '<=', end), orderBy('date', 'asc')));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Shift[];
};

export const fetchMonthReservations = async (month: Date) => {
  const start = format(startOfMonth(month), 'yyyy-MM-dd');
  const end = format(endOfMonth(month), 'yyyy-MM-dd');
  const snap = await getDocs(
    query(reservationsCol, where('date', '>=', start), where('date', '<=', end), orderBy('date', 'asc'), orderBy('time', 'asc'))
  );
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Reservation[];
};

export const fetchMonthShiftRequests = async (month: Date) => {
  const start = format(startOfMonth(month), 'yyyy-MM-dd');
  const end = format(endOfMonth(month), 'yyyy-MM-dd');
  const snap = await getDocs(
    query(shiftRequestsCol, where('date', '>=', start), where('date', '<=', end), orderBy('date', 'asc'), orderBy('status', 'asc'))
  );
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })) as ShiftRequest[];
};

export const fetchNotifications = async (uid: string) => {
  const snap = await getDocs(
    query(notificationsCol, where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(30))
  );
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })) as NotificationItem[];
};

export const fetchDayReservations = async (date: string) => {
  const snap = await getDocs(query(reservationsCol, where('date', '==', date), orderBy('time', 'asc')));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Reservation[];
};

export const deriveRecurringShifts = (users: AppUser[], month: Date, explicitShifts: Shift[]) => {
  const days = [] as Date[];
  for (let cursor = startOfMonth(month); cursor <= endOfMonth(month); cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }

  const explicitKeys = new Set(explicitShifts.map((item) => `${item.staffId}-${item.date}-${item.startTime}-${item.endTime}`));
  const derived: Shift[] = [];

  users.forEach((user) => {
    (user.defaultWeeklyShifts ?? []).forEach((rule: WeeklyShift) => {
      days.forEach((day) => {
        if (day.getDay() !== rule.weekday) return;
        const date = formatDateKey(day);
        const key = `${user.id}-${date}-${rule.startTime}-${rule.endTime}`;
        if (explicitKeys.has(key)) return;
        derived.push({
          id: `derived-${key}`,
          date,
          startTime: rule.startTime,
          endTime: rule.endTime,
          staffId: user.id,
          staffName: user.displayName,
          color: user.color,
          createdBy: 'system',
          derived: true,
          swapRequestId: null,
          history: []
        });
      });
    });
  });

  return [...explicitShifts, ...derived].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
};

export const saveShift = async (shift: Omit<Shift, 'id'> & { id?: string }) => {
  const payload = {
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    staffId: shift.staffId,
    staffName: shift.staffName,
    color: shift.color,
    createdBy: shift.createdBy,
    swapRequestId: shift.swapRequestId ?? null,
    history: shift.history ?? []
  };

  if (shift.id && !shift.id.startsWith('derived-')) {
    await updateDoc(doc(db, 'shifts', shift.id), payload);
    return shift.id;
  }

  const ref = await addDoc(shiftsCol, payload);
  return ref.id;
};

export const deleteShiftById = async (id: string) => {
  if (id.startsWith('derived-')) return;
  await deleteDoc(doc(db, 'shifts', id));
};

export const saveReservation = async (reservation: Omit<Reservation, 'id'> & { id?: string }) => {
  const payload = {
    date: reservation.date,
    time: reservation.time,
    name: reservation.name,
    partySize: reservation.partySize,
    course: reservation.course,
    notes: reservation.notes ?? '',
    createdBy: reservation.createdBy
  };

  if (reservation.id) {
    await updateDoc(doc(db, 'reservations', reservation.id), payload);
    return reservation.id;
  }

  const ref = await addDoc(reservationsCol, payload);
  return ref.id;
};

export const deleteReservationById = async (id: string) => deleteDoc(doc(db, 'reservations', id));

export const createStaffInvite = async (invite: Omit<StaffInvite, 'id' | 'createdAt'>) => {
  await addDoc(staffInvitesCol, {
    ...invite,
    createdAt: serverTimestamp()
  });
};

export const updateUserProfile = async (uid: string, data: Partial<AppUser>) => {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>);
};

const notifyUsers = async (userIds: string[], type: NotificationItem['type'], title: string, body: string, link?: string) => {
  const uniqueIds = Array.from(new Set(userIds));
  const users = await Promise.all(uniqueIds.map((uid) => getDoc(doc(db, 'users', uid))));
  const tokens = users
    .map((snap) => (snap.exists() ? ((snap.data().pushTokens as string[] | undefined) ?? []) : []))
    .flat();

  const batch = writeBatch(db);
  uniqueIds.forEach((uid) => {
    batch.set(doc(notificationsCol), {
      userId: uid,
      type,
      title,
      body,
      link: link ?? '',
      read: false,
      createdAt: nowIso()
    });
  });
  await batch.commit();

  if (typeof window !== 'undefined' && tokens.length > 0) {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens, title, body, link })
    });
  }
};

export const markNotificationAsRead = async (id: string) => {
  await updateDoc(doc(db, 'notifications', id), { read: true });
};

const ensurePersistedShift = async (shift: Shift) => {
  if (!shift.derived && !shift.id.startsWith('derived-')) return shift.id;
  return saveShift({
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    staffId: shift.staffId,
    staffName: shift.staffName,
    color: shift.color,
    createdBy: shift.createdBy,
    swapRequestId: null,
    history: [toShiftHistory('auto-created from recurring shift', shift.staffName)]
  });
};

export const createShiftRequest = async (shift: Shift, message: string, managers: AppUser[]) => {
  const shiftId = await ensurePersistedShift(shift);
  const requestRef = await addDoc(shiftRequestsCol, {
    shiftId,
    date: shift.date,
    requestedById: shift.staffId,
    requestedByName: shift.staffName,
    status: 'open',
    message,
    createdAt: nowIso()
  });

  await updateDoc(doc(db, 'shifts', shiftId), { swapRequestId: requestRef.id });
  await notifyUsers(
    managers.map((item) => item.id),
    'swap',
    '交代申請が追加されました',
    `${shift.staffName}さんが ${shift.date} ${shift.startTime}-${shift.endTime} の交代を募集しています`,
    '/shift'
  );

  return requestRef.id;
};

export const acceptShiftRequest = async (request: ShiftRequest, accepter: AppUser) => {
  const shiftRef = doc(db, 'shifts', request.shiftId);
  const shiftSnap = await getDoc(shiftRef);
  if (!shiftSnap.exists()) throw new Error('対象シフトが見つかりません');

  const currentShift = shiftSnap.data() as Omit<Shift, 'id'>;
  const nextHistory = [
    ...(currentShift.history ?? []),
    toShiftHistory(`swap accepted by ${accepter.displayName}`, accepter.displayName)
  ];

  await updateDoc(shiftRef, {
    staffId: accepter.id,
    staffName: accepter.displayName,
    color: accepter.color,
    swapRequestId: null,
    history: nextHistory
  });

  await updateDoc(doc(db, 'shiftRequests', request.id), {
    status: 'completed',
    acceptedById: accepter.id,
    acceptedByName: accepter.displayName,
    completedAt: nowIso()
  });

  await notifyUsers(
    [request.requestedById, accepter.id],
    'swap',
    'シフト交代が完了しました',
    `${request.date} のシフトが ${accepter.displayName} さんに変更されました`,
    '/shift'
  );
};

export const seedUsersIfMissing = async () => {
  const snap = await getDocs(query(usersCol, limit(1)));
  return snap.empty;
};

export const fetchDashboardData = async (month: Date, uid: string) => {
  const [users, shifts, reservations, requests, notifications] = await Promise.all([
    fetchUsers(),
    fetchMonthShifts(month),
    fetchMonthReservations(month),
    fetchMonthShiftRequests(month),
    fetchNotifications(uid)
  ]);

  return {
    users,
    shifts: deriveRecurringShifts(users, month, shifts),
    reservations,
    requests,
    notifications
  };
};
