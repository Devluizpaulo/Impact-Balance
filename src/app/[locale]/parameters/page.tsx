"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UCS_FACTORS, UCS_COST_PER_UNIT, GDP_PER_CAPITA_BRAZIL } from "@/lib/constants";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ParametersPage() {
  const t = useTranslations("ParametersPage");

  const factors = Object.entries(UCS_FACTORS).map(([key, value]) => ({
    name: t(`categories.${key}` as any),
    value: value,
  }));

  const otherConstants = [
    { name: t('costPerUcs'), value: `$${UCS_COST_PER_UNIT.toFixed(2)}` },
    { name: t('gdpBrazil'), value: `$${GDP_PER_CAPITA_BRAZIL.toLocaleString()}` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('backButton')}
                </Link>
            </Button>
          <Card>
            <CardHeader>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="mb-4 text-lg font-semibold">{t('impactFactors')}</h3>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.parameter')}</TableHead>
                      <TableHead className="text-right">{t('table.value')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factors.map((factor) => (
                      <TableRow key={factor.name}>
                        <TableCell>{factor.name}</TableCell>
                        <TableCell className="text-right">{factor.value}</TableCell>
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
                      <TableHead className="text-right">{t('table.value')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherConstants.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
