import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';
import { SettingsProvider } from '@/lib/settings';
import CookieConsent from '@/components/cookie-consent';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';


export const metadata: Metadata = {
  title: 'Balanço de Impacto',
  description: 'Calcule e equilibre o impacto ambiental de seus eventos.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SettingsProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster />
            <CookieConsent />
          </SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
