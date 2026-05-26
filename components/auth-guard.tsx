'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !firebaseUser && pathname !== '/login') {
      router.replace('/login');
    }
  }, [firebaseUser, loading, pathname, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">読み込み中...</div>;
  }

  if (!firebaseUser && pathname !== '/login') return null;
  return <>{children}</>;
}
