import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const adminApp =
  admin.apps.length > 0
    ? admin.app()
    : projectId && clientEmail && privateKey
      ? admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey
          })
        })
      : null;

export const adminMessaging = adminApp ? admin.messaging(adminApp) : null;
