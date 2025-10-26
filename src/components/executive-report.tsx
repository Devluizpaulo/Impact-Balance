"use client";

import type { CalculationResult, FormData } from "@/lib/types";
import ImpactCharts from "./impact-charts";
import ExportButtons from "@/components/export-buttons";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow, TableFooter } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSettings } from "@/lib/settings";

interface ExecutiveReportProps {
    results: CalculationResult;
    formData: FormData;
}

export default function ExecutiveReport({ results, formData }: ExecutiveReportProps) {
    const t_calc = useTranslations("ImpactCalculator");
    const t_report = useTranslations("ExecutiveReport");
    const { settings } = useSettings();

    const [reportDate, setReportDate] = useState<string | null>(null);
    useEffect(() => {
        // Set after mount to avoid hydration warnings
        const d = new Date();
        const iso = d.toISOString().slice(0, 10);
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => setReportDate(iso), 0);
    }, []);

    const formatCurrency = (value: number, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
    }
    const formatCurrencyUSD = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    const formatCurrencyEUR = (value: number) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }
    
    const formatUcs = (value: number) => {
        return value.toLocaleString('pt-BR');
    }
    
    const participantCategories: Record<string, string> = {
        organizers: t_calc('participants.organizersAndPromoters'),
        assemblers: t_calc('participants.assemblers'),
        suppliers: t_calc('participants.suppliers'),
        exhibitors: t_calc('participants.exhibitors'),
        supportTeam: t_calc('participants.supportTeam'),
        attendants: t_calc('participants.attendants'),
        support: t_calc('participants.support'),
        visitors: t_calc('participants.visitorsTitle'),
    };
    
    const indirectCostCategories: Record<string, string> = {
        ownershipRegistration: t_calc('indirectCosts.ownershipRegistration'),
        certificateIssuance: t_calc('indirectCosts.certificateIssuance'),
        websitePage: t_calc('indirectCosts.websitePage'),
    };

    return (
      <div id="executive-report" className="bg-white text-gray-800 p-6 sm:p-8 rounded-lg h-full relative flex flex-col shadow-lg">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 sm:p-8">
              <Image 
                  src="/selo.png" 
                  alt="Selo de Certificação"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                  className="opacity-5"
              />
          </div>
          <div id="report-content-for-export" className="flex-grow space-y-6 z-10 relative">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold font-headline text-gray-900">{t_report('title')}</h3>
                  <p className="text-gray-600">{t_report('forEvent')} <span className="font-semibold text-primary">{formData.eventName}</span></p>
                  <div className="text-xs text-gray-500 mt-1 space-x-2">
                    {reportDate && (
                      <span>
                        {"Relatório em: "}{reportDate}
                      </span>
                    )}
                    {settings.calculation.equivalences.ucsQuotationDate && (
                      <span>
                        {"Cotação UCS em: "}{settings.calculation.equivalences.ucsQuotationDate}
                      </span>
                    )}
                  </div>
                </div>
                <ExportButtons results={results} formData={formData} />
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed max-w-prose">
              {t_report('introduction')}
            </p>
            
            <div className="rounded-lg border bg-gray-50/50 p-4">
                <h4 className="font-headline text-lg text-gray-800 mb-4">{t_report('breakdownTitle')}</h4>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-gray-100/50 border-gray-200">
                                <TableHead className="text-gray-700">{t_report('table.participants')}</TableHead>
                                <TableHead className="text-right text-gray-700">{t_report('table.quantity')}</TableHead>
                                <TableHead className="text-right text-gray-700">{t_report('table.duration')}</TableHead>
                                <TableHead className="text-right text-gray-700">{t_report('table.totalUCS')}</TableHead>
                                <TableHead className="text-right text-gray-700">{t_report('table.directCost')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.breakdown.map((item) => (
                                <TableRow key={item.category} className="font-mono hover:bg-gray-100/50 border-gray-200">
                                    <TableCell className="font-sans font-medium text-gray-800">{participantCategories[item.category] || item.category}</TableCell>
                                    <TableCell className="text-right text-gray-700">{item.quantity}</TableCell>
                                    <TableCell className="text-right text-gray-700">{item.duration} <span className="text-xs text-gray-500">{t_calc(`participants.${item.durationUnit}` as any)}</span></TableCell>
                                    <TableCell className="text-right text-primary font-semibold">
                                       {formatUcs(item.ucs)}
                                    </TableCell>
                                    <TableCell className="text-right text-primary/90 font-semibold">{formatCurrency(item.cost)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={2} className="font-bold text-gray-800">{t_report('totals.totalParticipants')}</TableCell>
                                <TableCell className="text-right font-bold font-mono text-gray-800">{results.totalParticipants}</TableCell>
                                <TableCell className="text-right font-bold font-mono text-primary">{results.directUcs}</TableCell>
                                <TableCell className="text-right font-bold font-mono text-primary/90">{formatCurrency(results.directCost)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>

                <Separator className="my-4 bg-gray-200" />
                
                <div className="px-4">
                    <h4 className="font-bold text-gray-800 mb-2">{t_calc('indirectCosts.title')}</h4>
                      {results.indirectBreakdown.map(item => (
                          <div key={item.category} className="flex justify-between items-center text-sm font-mono text-gray-700">
                              <p className="font-sans">{indirectCostCategories[item.category]}</p>
                              <p className="font-semibold text-primary/90">{formatCurrency(item.cost)}</p>
                          </div>
                      ))}
                </div>

                <Separator className="my-4 bg-gray-200" />
                
                <h4 className="font-headline text-lg text-gray-800 mb-4 px-4">{t_report('summaryTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 px-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">{t_report('totals.directUCScost')}</span>
                            <span className="font-mono font-medium text-gray-800">{formatCurrency(results.directCost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">{t_report('totals.indirectUCScost')}</span>
                            <span className="font-mono font-medium text-gray-800">{formatCurrency(results.indirectCost)}</span>
                        </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t_report('totals.costPerParticipantDay')}</span>
                            <span className="font-mono font-medium text-gray-800">{formatCurrency(results.costPerParticipantDay)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">{t_report('totals.costPerParticipantHour')}</span>
                            <span className="font-mono font-medium text-gray-800">{formatCurrency(results.costPerParticipantHour)}</span>
                        </div>
                    </div>
                    <div className="space-y-2 text-right md:text-right self-end">
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-600 text-base">{t_report('totals.totalToCompensate')}</span>
                            <span className="font-mono font-bold text-lg text-primary">{results.totalUCS} UCS</span>
                        </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-600 text-base">{t_report('totals.totalBudgetBRL')}</span>
                            <span className="font-mono font-bold text-lg text-primary">{formatCurrency(results.totalCost, 'BRL')}</span>
                        </div>

                        {results.totalCostUSD && (
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-600 text-base">{t_report('totals.totalBudgetUSD')}</span>
                                <span className="font-mono font-bold text-lg text-primary">{formatCurrencyUSD(results.totalCostUSD)}</span>
                            </div>
                        )}
                        {results.totalCostEUR && (
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-600 text-base">{t_report('totals.totalBudgetEUR')}</span>
                                <span className="font-mono font-bold text-lg text-primary">{formatCurrencyEUR(results.totalCostEUR)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div id="charts-content">
                <ImpactCharts results={results} />
            </div>
        </div>
      </div>
    );
}

    