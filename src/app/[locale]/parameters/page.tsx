"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings, type SystemSettings } from "@/lib/settings";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Save } from "lucide-react";
import AppShell from "@/components/layout/app-shell";

export default function ParametersPage() {
  const t = useTranslations("ParametersPage");
  const { settings, setSettings, saveSettings, resetSettings, isClient } = useSettings();

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [group, key] = name.split('.') as [keyof SystemSettings, string];

    if (group && key && group in settings) {
      const groupSettings = settings[group];
      if (typeof groupSettings === 'object' && groupSettings !== null) {
        setSettings({
          ...settings,
          [group]: {
            ...(groupSettings as object),
            [key]: Number(value) || 0,
          },
        });
      }
    }
  };

  const handleUcsCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      ucsCostPerUnit: Number(e.target.value) || 0
    });
  }

  if (!isClient) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </AppShell>
    );
  }

  const ucsFactors = Object.entries(settings.ucsFactors);
  const perCapitaFactors = Object.entries(settings.perCapitaFactors);
  const equivalences = Object.entries(settings.equivalences);
  const indirectCosts = Object.entries(settings.indirectCosts);

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetSettings} variant="outline">
                <RefreshCcw /> {t('resetButton')}
              </Button>
              <Button onClick={saveSettings}>
                <Save /> {t('saveButton')}
              </Button>
            </div>
          </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('impactFactors')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ucsFactors.map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{t(`ucsFactors.${key}` as any)}</TableCell>
                      <TableCell>
                        <Input type="number" name={`ucsFactors.${key}`} value={value} onChange={handleNestedChange} className="text-right" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('perCapitaBasis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {perCapitaFactors.map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{t(`perCapitaFactors.${key}` as any)}</TableCell>
                      <TableCell>
                        <Input type="number" name={`perCapitaFactors.${key}`} value={value} onChange={handleNestedChange} className="text-right" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('indirectCosts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {indirectCosts.map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{t(`indirectCostsLabels.${key}` as any)}</TableCell>
                      <TableCell>
                        <Input type="number" name={`indirectCosts.${key}`} value={value} onChange={handleNestedChange} className="text-right" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('equivalencesAndCosts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {equivalences.map(([key, value]) => (
                     <TableRow key={key}>
                      <TableCell>{t(`equivalences.${key}` as any)}</TableCell>
                      <TableCell>
                        <Input type="number" name={`equivalences.${key}`} value={value} onChange={handleNestedChange} className="text-right" />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>{t('costPerUcs')}</TableCell>
                    <TableCell>
                      <Input type="number" name="ucsCostPerUnit" value={settings.ucsCostPerUnit} onChange={handleUcsCostChange} className="text-right" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
