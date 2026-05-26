import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: '飲食店シフト・予約管理',
  description: '小規模飲食店向けのスマホ最適化シフト・予約管理WEBアプリ',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
