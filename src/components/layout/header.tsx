import LanguageSwitcher from './language-switcher';
import { Link } from '@/navigation';
import Image from 'next/image';

export default function Header({ mobileNav }: { mobileNav: React.ReactNode }) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
        <Image src="/logo.png" alt="BMV Logo" width={120} height={41} priority />
      </Link>
      {mobileNav}
      <div className="w-full flex-1" />
      <LanguageSwitcher />
    </header>
  );
}
