import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';
import { SettingsProvider } from '@/lib/settings';
import CookieConsent from '@/components/cookie-consent';

export const metadata: Metadata = {
  title: 'Balanço de Impacto',
  description: 'Calcule e equilibre o impacto ambiental de seus eventos.',
};

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SettingsProvider>
            {children}
            <Toaster />
            <CookieConsent />
          </SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
