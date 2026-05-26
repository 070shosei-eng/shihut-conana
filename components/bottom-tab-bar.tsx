'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Home, Settings, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/app/providers';

const items = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/shift', label: 'シフト', icon: CalendarDays },
  { href: '/reservations', label: '予約', icon: UtensilsCrossed },
  { href: '/settings', label: '設定', icon: Settings }
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const tabs = profile?.role === 'manager' ? [...items, { href: '/admin', label: '管理', icon: ShieldCheck }] : items;

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-between rounded-t-[28px] border border-white/60 px-3 pb-6 pt-3 shadow-sheet tab-safe">
      {tabs.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition ${
              active ? 'bg-primary text-white shadow-card' : 'text-muted'
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
