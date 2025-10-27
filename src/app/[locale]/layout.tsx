import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';
import { SettingsProvider } from '@/lib/settings';
import { AuthProvider } from '@/lib/auth';
import CookieConsent from '@/components/cookie-consent';
import { Inter, Roboto_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';


export const metadata: Metadata = {
  title: 'Calculadora de Eventos',
  description: 'Calcule e equilibre o impacto ambiental de seus eventos.',
};

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;
  // Inform next-intl of the chosen locale early to avoid sync headers usage
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          robotoMono.variable
        )}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <SettingsProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
              <Toaster />
              <CookieConsent />
            </SettingsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
