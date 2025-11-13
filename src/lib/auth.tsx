
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from '@/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/firebase/config';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";

interface AuthContextType {
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  promptLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const t = useTranslations("Auth");
  const router = useRouter();

  const isAdmin = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const login = async (emailInput: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, emailInput, pass);
      setIsLoginPromptOpen(false);
      setEmail('');
      setPassword('');
      toast({ title: t('loginSuccess.title'), description: t('loginSuccess.description') });
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      toast({ variant: 'destructive', title: t('loginError.title'), description: t('loginError.description') });
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: t('logoutSuccess.title') });
      router.push('/');
    } catch (error) {
      console.error("Firebase Signout Error:", error);
    }
  };
  
  const promptLogin = () => {
    if (!isAdmin) {
      setIsLoginPromptOpen(true);
    }
  }

  const handleLoginAttempt = () => {
    login(email, password);
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoginAttempt();
    }
  }

  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setIsLoginPromptOpen(false);
  }


  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, promptLogin }}>
      {children}
      <AlertDialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('modal.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('modal.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="email">{t('modal.emailLabel')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('modal.emailPlaceholder')}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('modal.passwordLabel')}</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('modal.passwordPlaceholder')}
                maxLength={60}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{t('modal.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginAttempt}>{t('modal.login')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
