'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../../../navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { locales } from '../../../config';

export default function LanguageSwitcher() {
  const t = useTranslations('Header.languages');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-5 w-5 text-muted-foreground" />
      <Select onValueChange={onSelectChange} defaultValue={locale}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={t(locale as 'pt' | 'en' | 'es')} />
        </SelectTrigger>
        <SelectContent>
          {(locales as (keyof typeof t)[]).map((cur) => (
            <SelectItem key={cur} value={cur}>{t(cur)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
