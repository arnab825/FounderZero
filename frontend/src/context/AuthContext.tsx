import React, { createContext,  useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInAsDemo: () => {},
  signOut: async () => {},
  getIdToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedDemo = localStorage.getItem('demo_user');
    if (savedDemo) {
      try {
        return JSON.parse(savedDemo);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Founder',
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          isDemo: false
        });
        localStorage.removeItem('demo_user');
      } else if (!localStorage.getItem('demo_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase Auth is not initialized. Check your Firebase API Keys.");
    }
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized. Check your Firebase API Keys.");
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized. Check your Firebase API Keys.");
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        photoURL: cred.user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cred.user.uid}`,
        isDemo: false
      });
    }
  };

  const signInAsDemo = () => {
    const demoProfile: UserProfile = {
      uid: `demo-founder-1`,
      email: 'alex@founderzero.ai',
      displayName: 'Alex (Founder)',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=founderzero',
      isDemo: true
    };
    setUser(demoProfile);
    localStorage.setItem('demo_user', JSON.stringify(demoProfile));
  };

  const signOut = async () => {
    if (auth && firebaseUser) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    localStorage.removeItem('demo_user');
    setUser(null);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (firebaseUser) {
      try {
        return await firebaseUser.getIdToken();
      } catch {
        return null;
      }
    }
    return user ? `mock-token-${user.uid}` : null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signInWithEmail, 
      signUpWithEmail, 
      signInAsDemo, 
      signOut, 
      getIdToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
