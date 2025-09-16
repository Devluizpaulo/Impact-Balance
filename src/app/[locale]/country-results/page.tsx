"use client";

import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CountryResultsPage() {
  const t = useTranslations("CountryResultsPage");

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>{t('placeholder.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center h-[300px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground opacity-50"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                    <h3 className="mt-4 text-xl font-semibold text-muted-foreground">{t('placeholder.awaitingData')}</h3>
                    <p className="mt-2 text-muted-foreground">
                        {t('placeholder.description')}
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
