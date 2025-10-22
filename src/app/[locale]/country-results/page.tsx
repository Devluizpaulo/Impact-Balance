
"use client";

import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { countryFootprintData, type CountryFootprintData } from "@/lib/data/country-footprint-data";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";


const DataRow = ({ label, value, unit = '' }: { label: string; value: string | number | null, unit?: string }) => {
    const formattedValue = typeof value === 'number' ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value) : value;

    return (
        <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-b-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{formattedValue} {unit}</span>
        </div>
    );
};

const FootprintTable = ({ data, title }: { data: Record<string, number>, title: string }) => {
  const t = useTranslations("CountryResultsPage.footprintTypes");
  const keys = Object.keys(data);

  return (
    <div className="mt-2">
      <h4 className="font-semibold text-md mb-2 text-primary/90">{title}</h4>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('component')}</TableHead>
              <TableHead className="text-right">{t('value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
               <TableRow key={key}>
                <TableCell>{t(key as any)}</TableCell>
                <TableCell className="text-right font-mono">{new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(data[key])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};


function CountryCard({ countryData }: { countryData: CountryFootprintData }) {
  const t = useTranslations("CountryResultsPage");

  const deficitOrReserve = countryData.deficitOrReserve;
  const isDeficit = deficitOrReserve < 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="font-headline">{countryData.country}</CardTitle>
                <CardDescription>{countryData.region} / {countryData.incomeGroup}</CardDescription>
            </div>
             <Badge variant={isDeficit ? 'destructive' : 'default'} className="flex items-center gap-1">
              {isDeficit ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14} />}
              {isDeficit ? t('deficit') : t('reserve')}: {Math.abs(deficitOrReserve)}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mb-6 text-sm">
          <DataRow label={t('population')} value={countryData.population} unit="M" />
          <DataRow label={t('hdi')} value={countryData.hdi} />
          <DataRow label={t('gdpPerCapita')} value={countryData.perCapitaGdp} />
          <DataRow label={t('lifeExpectancy')} value={countryData.lifeExpectancy} unit="anos"/>
          <DataRow label={t('earthsRequired')} value={countryData.earthsRequired} />
          <DataRow label={t('countriesRequired')} value={countryData.countriesRequired} />
           <DataRow label={t('dataQuality')} value={countryData.dataQuality} />
        </div>

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-semibold">{t('consumption.title')}</AccordionTrigger>
            <AccordionContent>
              <FootprintTable data={countryData.consumption} title={t('consumption.tableTitle')} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-semibold">{t('production.title')}</AccordionTrigger>
            <AccordionContent>
              <FootprintTable data={countryData.production} title={t('production.tableTitle')} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-semibold">{t('biocapacity.title')}</AccordionTrigger>
            <AccordionContent>
              <FootprintTable data={countryData.biocapacity} title={t('biocapacity.tableTitle')} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </CardContent>
    </Card>
  )
}

export default function CountryResultsPage() {
    const t = useTranslations("CountryResultsPage");

    return (
        <AppShell>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <div className="space-y-8">
                    {countryFootprintData.map((country) => (
                        <CountryCard key={country.country} countryData={country} />
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
