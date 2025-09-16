import { Leaf } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './language-switcher';
import { SidebarTrigger } from '../ui/sidebar';

export default function Header() {
  const t = useTranslations('Header');
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className='flex items-center gap-2'>
            <SidebarTrigger className="md:hidden" />
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary sm:hidden">
              <Leaf className="w-6 h-6" />
            </Link>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
