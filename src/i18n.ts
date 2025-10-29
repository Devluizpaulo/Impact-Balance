import {getRequestConfig, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './config';

export default getRequestConfig(async ({ locale }) => {
  setRequestLocale(locale);
  if (!locales.includes(locale as string)) notFound();
  
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});