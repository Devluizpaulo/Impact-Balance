import { Leaf } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './language-switcher';

export default function Header() {
  const t = useTranslations('Header');
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
          <Leaf className="w-6 h-6" />
          <span>{t('title')}</span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
