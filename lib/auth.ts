import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  deleteDoc
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import type { AppUser, StaffInvite } from '@/types';

const usersCol = collection(db, 'users');
const inviteCol = collection(db, 'staffInvites');

const upsertUserFromAuth = async (credential: UserCredential) => {
  const firebaseUser = credential.user;
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) return userSnap.data() as AppUser;

  const inviteQuery = query(inviteCol, where('email', '==', firebaseUser.email), limit(1));
  const inviteSnap = await getDocs(inviteQuery);
  const firstUserSnap = await getDocs(query(usersCol, limit(1)));

  const invite = inviteSnap.empty ? null : ({ id: inviteSnap.docs[0].id, ...inviteSnap.docs[0].data() } as StaffInvite);
  const role = invite?.role ?? (firstUserSnap.empty ? 'manager' : 'staff');
  const color = invite?.color ?? '#2563eb';
  const displayName = invite?.displayName ?? firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'スタッフ';

  const payload: Omit<AppUser, 'id'> = {
    authUid: firebaseUser.uid,
    displayName,
    email: firebaseUser.email ?? '',
    role,
    color,
    pushTokens: [],
    notificationEnabled: false,
    defaultWeeklyShifts: [],
    createdAt: new Date().toISOString()
  };

  await setDoc(userRef, {
    ...payload,
    createdAt: serverTimestamp()
  });

  if (invite) {
    await deleteDoc(doc(db, 'staffInvites', invite.id));
  }

  return { id: firebaseUser.uid, ...payload };
};

export const emailLogin = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserFromAuth(credential);
  return credential;
};

export const emailRegister = async (name: string, email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser && name) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
  await upsertUserFromAuth(credential);
  return credential;
};

export const googleLogin = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  await upsertUserFromAuth(credential);
  return credential;
};

export const logout = async () => signOut(auth);
