import {getRequestConfig, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './config';
 
export default getRequestConfig(async ({ locale }) => {
  // Inform next-intl of the chosen locale (compatible with current version)
  setRequestLocale(locale);
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as string)) notFound();
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});