
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface AuthContextType {
  isAdmin: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  promptLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const t = useTranslations("Auth");

  const login = (emailInput: string, pass: string): boolean => {
    // Simple credential check. In a real app, use a proper auth system.
    if (emailInput === 'admin@impactbalance.com' && pass === '123456') {
      setIsAdmin(true);
      setIsLoginPromptOpen(false);
      setEmail('');
      setPassword('');
      toast({ title: t('loginSuccess.title'), description: t('loginSuccess.description') });
      return true;
    }
    toast({ variant: 'destructive', title: t('loginError.title'), description: t('loginError.description') });
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    toast({ title: t('logoutSuccess.title') });
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
                maxLength={6}
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
