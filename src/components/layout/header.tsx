import LanguageSwitcher from './language-switcher';
import { Link } from '@/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Button } from '../ui/button';
import { LogOut, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


export default function Header({ mobileNav }: { mobileNav: React.ReactNode }) {
  const { isAdmin, logout, promptLogin } = useAuth();
  const t = useTranslations("AppShell");

  return (
    <header className={cn("sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full")}>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image src="/logo.png" alt="BMV Logo" width={120} height={41} priority />
          <span className="sr-only">BMV</span>
        </Link>
      </nav>

      {mobileNav}
      <div className="w-full flex-1" />
      <LanguageSwitcher />

      {!isAdmin ? (
          <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={promptLogin}>
                  <Lock className="h-5 w-5" />
                  <span className="sr-only">{t('adminLogin')}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('adminLogin')}</p>
            </TooltipContent>
          </Tooltip>
      ) : (
        <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex">
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </Button>
      )}
    </header>
  );
}
