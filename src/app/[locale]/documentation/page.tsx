"use client";

import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function DocumentationPage() {
  const t = useTranslations("DocumentationPage");

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Conteúdo da Documentação</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Por favor, cole aqui o conteúdo da sua documentação. Eu o formatarei corretamente.
              </p>
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
