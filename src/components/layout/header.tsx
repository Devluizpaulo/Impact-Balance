import LanguageSwitcher from './language-switcher';
import { Link } from '@/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Header({ mobileNav }: { mobileNav: React.ReactNode }) {
  return (
    <header className={cn("sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full")}>
      <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
        <Image
          src="/logo.png"
          alt="BMV Logo"
          width={120}
          height={41}
          priority
          style={{ width: 'auto', height: 'auto' }}
        />
      </Link>
      {mobileNav}
      <div className="w-full flex-1" />
      <LanguageSwitcher />
    </header>
  );
}
