'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchDashboardData } from '@/lib/firestore';
import { useAuth } from '@/app/providers';
import type { AppUser, NotificationItem, Reservation, Shift, ShiftRequest } from '@/types';

export type DashboardState = {
  users: AppUser[];
  shifts: Shift[];
  reservations: Reservation[];
  requests: ShiftRequest[];
  notifications: NotificationItem[];
};

const initialState: DashboardState = {
  users: [],
  shifts: [],
  reservations: [],
  requests: [],
  notifications: []
};

export const useDashboardData = (month: Date) => {
  const { profile } = useAuth();
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const data = await fetchDashboardData(month, profile.id);
    setState(data);
    setLoading(false);
  }, [month, profile]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, loading, refresh };
};
