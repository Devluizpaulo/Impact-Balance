'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales } from '@/config';
import { BrazilFlag, SpainFlag, UsaFlag } from '@/components/icons/flags';

const flagComponents: { [key: string]: React.ReactNode } = {
  pt: <BrazilFlag className="w-5 h-5" />,
  en: <UsaFlag className="w-5 h-5" />,
  es: <SpainFlag className="w-5 h-5" />,
};

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
      <Select onValueChange={onSelectChange} defaultValue={locale}>
        <SelectTrigger className="w-auto p-2">
          <SelectValue asChild>
            <div className="flex items-center gap-2">
              {flagComponents[locale]}
              <span className="hidden md:inline">{t(locale as 'pt' | 'en' | 'es')}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(locales as (keyof ReturnType<typeof t>)[]).map((cur) => (
            <SelectItem key={cur} value={cur}>
              <div className="flex items-center gap-2">
                {flagComponents[cur]}
                <span>{t(cur)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
