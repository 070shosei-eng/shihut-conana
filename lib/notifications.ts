import { doc, updateDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { toast } from 'sonner';
import { db, getMessagingIfSupported } from '@/lib/firebase';

export const enablePushNotifications = async (uid: string, existingTokens: string[] = []) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    toast.error('この端末では通知に対応していません');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    toast.error('通知許可が必要です');
    return null;
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  const messaging = await getMessagingIfSupported();
  if (!messaging) {
    toast.error('このブラウザでは Push 通知が利用できません');
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  const nextTokens = Array.from(new Set([...(existingTokens ?? []), token]));

  await updateDoc(doc(db, 'users', uid), {
    pushTokens: nextTokens,
    notificationEnabled: true
  });

  toast.success('Push通知を有効化しました');
  return token;
};

export const disablePushNotifications = async (uid: string) => {
  await updateDoc(doc(db, 'users', uid), {
    pushTokens: [],
    notificationEnabled: false
  });
  toast.success('Push通知を無効化しました');
};
