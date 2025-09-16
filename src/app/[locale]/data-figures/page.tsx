"use client";

import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function DataFiguresPage() {
  const t = useTranslations("DataFiguresPage");

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>World Data and Figures (2022)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will display world data and figures from 2022. Content to be added.
              </p>
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
