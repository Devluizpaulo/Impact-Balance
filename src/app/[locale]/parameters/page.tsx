"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings, type SystemSettings } from "@/lib/settings";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Save } from "lucide-react";

type NestedKey<T> = {
  [K in keyof T]: T[K] extends object ? `${K & string}.${keyof T[K] & string}` : never
}[keyof T];


export default function ParametersPage() {
  const t = useTranslations("ParametersPage");
  const { settings, setSettings, saveSettings, resetSettings, isClient } = useSettings();

  // Generic handler for nested settings
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
      <div className="p-8">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const ucsFactors = Object.entries(settings.ucsFactors);
  const perCapitaFactors = Object.entries(settings.perCapitaFactors);
  const equivalences = Object.entries(settings.equivalences);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetSettings} variant="outline">
                <RefreshCcw className="mr-2" /> {t('resetButton')}
              </Button>
              <Button onClick={saveSettings}>
                <Save className="mr-2" /> {t('saveButton')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* UCS Impact Factors */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('impactFactors')}</h3>
            <div className="overflow-hidden rounded-md border">
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
            </div>
          </div>

          {/* Per Capita Calculation Basis */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('perCapitaBasis')}</h3>
            <div className="overflow-hidden rounded-md border">
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
            </div>
          </div>

          {/* Equivalences and Costs */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('equivalencesAndCosts')}</h3>
            <div className="overflow-hidden rounded-md border">
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
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
