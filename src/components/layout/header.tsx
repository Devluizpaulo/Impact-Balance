import LanguageSwitcher from './language-switcher';
import { Link } from '@/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Header({ mobileNav }: { mobileNav: React.ReactNode }) {
  const { isAdmin, logout } = useAuth();
  const t = useTranslations("AppShell");

  return (
    <header className={cn("sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full")}>
      <div className="md:hidden">
         <Link href="/" className="flex items-center gap-2 font-bold">
             <Image src="/logo.png" alt="BMV Logo" width={120} height={41} priority />
          </Link>
      </div>
      {mobileNav}
      <div className="w-full flex-1" />
      <LanguageSwitcher />
       {isAdmin && (
        <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex">
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </Button>
      )}
    </header>
  );
}
