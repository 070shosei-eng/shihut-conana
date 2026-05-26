import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { tokens, title, body, link } = await request.json();

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    if (!adminMessaging) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'admin messaging disabled' });
    }

    const response = await adminMessaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        fcmOptions: {
          link: link || '/'
        },
        notification: {
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        }
      }
    });

    return NextResponse.json({ ok: true, successCount: response.successCount, failureCount: response.failureCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
