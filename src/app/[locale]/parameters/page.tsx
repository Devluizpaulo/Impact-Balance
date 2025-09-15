"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings, type SystemSettings } from "@/lib/settings";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Save } from "lucide-react";
import { useEffect } from "react";

export default function ParametersPage() {
  const t = useTranslations("ParametersPage");
  const { settings, setSettings, saveSettings, resetSettings, isClient } = useSettings();

  // Helper function to handle input changes for nested ucsFactors
  const handleFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      ucsFactors: {
        ...settings.ucsFactors,
        [name]: Number(value) || 0,
      },
    });
  };

  // Helper function for top-level settings
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: Number(value) || 0,
    });
  };

  if (!isClient) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const factors = Object.entries(settings.ucsFactors).map(([key, value]) => ({
    key: key as keyof typeof settings.ucsFactors,
    name: t(`categories.${key}` as any),
    value: value,
  }));

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
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">{t('impactFactors')}</h3>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.parameter')}</TableHead>
                  <TableHead className="w-48 text-right">{t('table.value')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factors.map((factor) => (
                  <TableRow key={factor.key}>
                    <TableCell>{factor.name}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        name={factor.key}
                        value={factor.value}
                        onChange={handleFactorChange}
                        className="text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <h3 className="mb-4 mt-8 text-lg font-semibold">{t('otherConstants')}</h3>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.parameter')}</TableHead>
                  <TableHead className="w-48 text-right">{t('table.value')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{t('costPerUcs')}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="ucsCostPerUnit"
                      value={settings.ucsCostPerUnit}
                      onChange={handleSettingChange}
                      className="text-right"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('gdpBrazil')}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="gdpPerCapita"
                      value={settings.gdpPerCapita}
                      onChange={handleSettingChange}
                      className="text-right"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
