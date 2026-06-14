import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Subscribe realtime to user document so points update instantly
      const userRef = doc(db, 'users', fbUser.uid);
      const unsubscribeDoc = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.data() as User);
        } else {
          // Create profile if doesn't exist (Google sign-in first time)
          const newUser: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
            uid: fbUser.uid,
            email: fbUser.email!,
            displayName: fbUser.displayName || fbUser.email!.split('@')[0],
            photoURL: fbUser.photoURL || undefined,
            role: 'user',
            points: 0,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, newUser);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to user profile:", error);
        // Fallback to basic user info
        setUser({
          uid: fbUser.uid,
          email: fbUser.email!,
          displayName: fbUser.displayName || fbUser.email!.split('@')[0],
          photoURL: fbUser.photoURL || undefined,
          role: 'user',
          createdAt: new Date(),
        });
        setLoading(false);
      });

      // Return inner cleanup stored via closure
      return unsubscribeDoc;
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(fbUser, { displayName });
    const newUser = {
      uid: fbUser.uid,
      email: fbUser.email!,
      displayName,
      role: 'user' as const,
      points: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', fbUser.uid), newUser);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
