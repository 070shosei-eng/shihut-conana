'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, LogIn, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { emailLogin, emailRegister, googleLogin } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('manager@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (firebaseUser) {
      router.replace('/');
    }
  }, [firebaseUser, router]);

  const submit = async () => {
    try {
      setLoading(true);
      if (mode === 'login') {
        await emailLogin(email, password);
      } else {
        await emailRegister(name, email, password);
      }
      router.replace('/');
    } catch (error) {
      toast.error(mode === 'login' ? 'ログインに失敗しました' : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await googleLogin();
      router.replace('/');
    } catch (error) {
      toast.error('Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
      <div className="w-full rounded-[32px] bg-white p-5 shadow-card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Shift & Reservation</p>
        <h1 className="text-3xl font-bold text-ink">飲食店向け管理アプリ</h1>
        <p className="mt-2 text-sm text-muted">スマホで見やすい、シンプルなシフト・予約管理。</p>

        <div className="mt-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button onClick={() => setMode('login')} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === 'login' ? 'bg-white shadow-sm' : 'text-muted'}`}>ログイン</button>
          <button onClick={() => setMode('register')} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === 'register' ? 'bg-white shadow-sm' : 'text-muted'}`}>新規登録</button>
        </div>

        <div className="mt-5 space-y-3">
          {mode === 'register' ? <input placeholder="表示名" value={name} onChange={(e) => setName(e.target.value)} /> : null}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input className="pl-11" type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input className="pl-11" type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button onClick={submit} disabled={loading} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">
            {mode === 'login' ? 'メールでログイン' : 'メールで新規登録'}
          </button>
          <button onClick={loginWithGoogle} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink">
            <Chrome size={18} /> Googleでログイン
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs text-muted">
          <p>初回登録ユーザーは自動的に店長になります。</p>
          <p className="mt-1">店長が追加したスタッフは、登録済みメールアドレスで新規登録すると自動連携されます。</p>
        </div>
      </div>
    </main>
  );
}
