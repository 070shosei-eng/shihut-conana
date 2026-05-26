import admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey
    })
  });
}

const db = admin.firestore();
const auth = admin.auth();

const users = [
  {
    uid: 'manager-demo-001',
    email: 'manager@example.com',
    password: 'password123',
    displayName: '店長 佐藤',
    role: 'manager',
    color: '#2563eb',
    defaultWeeklyShifts: []
  },
  {
    uid: 'staff-demo-001',
    email: 'staff.a@example.com',
    password: 'password123',
    displayName: 'A君',
    role: 'staff',
    color: '#0ea5e9',
    defaultWeeklyShifts: [
      { weekday: 1, startTime: '10:00', endTime: '15:00' },
      { weekday: 3, startTime: '17:00', endTime: '22:00' }
    ]
  },
  {
    uid: 'staff-demo-002',
    email: 'staff.b@example.com',
    password: 'password123',
    displayName: 'Bさん',
    role: 'staff',
    color: '#ef4444',
    defaultWeeklyShifts: [
      { weekday: 5, startTime: '17:00', endTime: '22:00' },
      { weekday: 6, startTime: '11:00', endTime: '20:00' }
    ]
  },
  {
    uid: 'staff-demo-003',
    email: 'staff.c@example.com',
    password: 'password123',
    displayName: 'Cさん',
    role: 'staff',
    color: '#22c55e',
    defaultWeeklyShifts: [
      { weekday: 2, startTime: '10:00', endTime: '15:00' },
      { weekday: 4, startTime: '17:00', endTime: '22:00' }
    ]
  }
];

const today = new Date();
const toKey = (date: Date) => date.toISOString().slice(0, 10);
const y = today.getFullYear();
const m = today.getMonth();

const shifts = [
  {
    date: toKey(new Date(y, m, today.getDate())),
    startTime: '10:00',
    endTime: '15:00',
    staffId: 'staff-demo-001',
    staffName: 'A君',
    color: '#0ea5e9',
    createdBy: '店長 佐藤',
    swapRequestId: null,
    history: []
  },
  {
    date: toKey(new Date(y, m, today.getDate())),
    startTime: '17:00',
    endTime: '22:00',
    staffId: 'staff-demo-002',
    staffName: 'Bさん',
    color: '#ef4444',
    createdBy: '店長 佐藤',
    swapRequestId: null,
    history: []
  }
];

const reservations = [
  {
    date: toKey(new Date(y, m, today.getDate())),
    time: '18:30',
    name: '田中様',
    partySize: 6,
    course: '宴会',
    notes: '誕生日プレートあり',
    createdBy: '店長 佐藤'
  },
  {
    date: toKey(new Date(y, m, today.getDate() + 1)),
    time: '19:00',
    name: '山本様',
    partySize: 12,
    course: '貸切',
    notes: 'プロジェクター利用',
    createdBy: '店長 佐藤'
  }
];

async function ensureAuthUser(user: (typeof users)[number]) {
  try {
    await auth.getUser(user.uid);
  } catch {
    await auth.createUser({
      uid: user.uid,
      email: user.email,
      password: user.password,
      displayName: user.displayName
    });
  }
}

async function main() {
  for (const user of users) {
    await ensureAuthUser(user);
    await db.collection('users').doc(user.uid).set({
      authUid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      color: user.color,
      pushTokens: [],
      notificationEnabled: false,
      defaultWeeklyShifts: user.defaultWeeklyShifts,
      createdAt: new Date().toISOString()
    });
  }

  const batch = db.batch();
  shifts.forEach((shift, index) => {
    batch.set(db.collection('shifts').doc(`seed-shift-${index + 1}`), shift);
  });
  reservations.forEach((reservation, index) => {
    batch.set(db.collection('reservations').doc(`seed-reservation-${index + 1}`), reservation);
  });
  batch.set(db.collection('shiftRequests').doc('seed-request-1'), {
    shiftId: 'seed-shift-2',
    date: toKey(new Date(y, m, today.getDate())),
    requestedById: 'staff-demo-002',
    requestedByName: 'Bさん',
    status: 'open',
    message: `${toKey(new Date(y, m, today.getDate()))} のシフト代われる人募集`,
    createdAt: new Date().toISOString()
  });
  batch.set(db.collection('shifts').doc('seed-shift-2'), {
    ...shifts[1],
    swapRequestId: 'seed-request-1'
  });
  await batch.commit();

  console.log('Seed completed');
  console.log('manager@example.com / password123');
  console.log('staff.a@example.com / password123');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
