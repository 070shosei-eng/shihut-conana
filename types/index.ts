export type UserRole = 'manager' | 'staff';
export type CourseType = '宴会' | '貸切' | '一般';
export type ShiftRequestStatus = 'open' | 'accepted' | 'completed';

export type WeeklyShift = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export type AppUser = {
  id: string;
  authUid: string;
  displayName: string;
  email: string;
  role: UserRole;
  color: string;
  pushTokens?: string[];
  notificationEnabled?: boolean;
  defaultWeeklyShifts?: WeeklyShift[];
  createdAt?: string;
};

export type ShiftHistory = {
  action: string;
  by: string;
  at: string;
};

export type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  staffId: string;
  staffName: string;
  color: string;
  createdBy: string;
  derived?: boolean;
  swapRequestId?: string | null;
  history?: ShiftHistory[];
};

export type Reservation = {
  id: string;
  date: string;
  time: string;
  name: string;
  partySize: number;
  course: CourseType;
  notes?: string;
  createdBy: string;
};

export type ShiftRequest = {
  id: string;
  shiftId: string;
  date: string;
  requestedById: string;
  requestedByName: string;
  acceptedById?: string;
  acceptedByName?: string;
  status: ShiftRequestStatus;
  message: string;
  createdAt: string;
  completedAt?: string;
};

export type NotificationItem = {
  id: string;
  userId: string;
  type: 'shift' | 'swap' | 'reservation';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export type StaffInvite = {
  id: string;
  email: string;
  displayName: string;
  color: string;
  role: UserRole;
  createdAt: string;
};
