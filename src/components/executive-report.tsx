"use client";

import type { CalculationResult, FormData } from "@/lib/types";
import { BarChart, ListTree } from "lucide-react";
import ImpactCharts from "../impact-charts";
import ExportButtons from "@/components/export-buttons";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface ExecutiveReportProps {
    results: CalculationResult;
    formData: FormData;
}

export default function ExecutiveReport({ results, formData }: ExecutiveReportProps) {
    const t_calc = useTranslations("ImpactCalculator");
    const t_report = useTranslations("ExecutiveReport");

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
      <div id="executive-report" className="bg-gray-900 text-gray-100 p-6 rounded-lg h-full border border-gray-700 flex flex-col">
        <div id="report-content-for-export" className="flex-grow space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold font-headline text-white">{t_report('title')}</h3>
                  <p className="text-gray-400">{t_report('forEvent')} <span className="font-semibold text-primary">{formData.eventName}</span></p>
                </div>
                <ExportButtons results={results} formData={formData} />
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed">
              {t_report('introduction')}
            </p>
            
            <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4">
                <h4 className="font-headline text-lg text-white mb-4">{t_report('breakdownTitle')}</h4>
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-600 hover:bg-gray-700/30">
                            <TableHead className="text-white">{t_report('table.participants')}</TableHead>
                            <TableHead className="text-right text-white">{t_report('table.quantity')}</TableHead>
                            <TableHead className="text-right text-white">{t_report('table.duration')}</TableHead>
                            <TableHead className="text-right text-white">{t_report('table.totalUCS')}</TableHead>
                            <TableHead className="text-right text-white">{t_report('table.directCost')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.breakdown.map((item) => (
                            <TableRow key={item.category} className="border-gray-700 font-mono hover:bg-gray-700/30">
                                <TableCell className="font-sans font-medium text-gray-300">{participantCategories[item.category] || item.category}</TableCell>
                                <TableCell className="text-right text-gray-300">{item.quantity}</TableCell>
                                <TableCell className="text-right text-gray-300">{item.duration} <span className="text-xs text-gray-500">{t_calc(`participants.${item.durationUnit}` as any)}</span></TableCell>
                                <TableCell className="text-right text-amber-400">{item.ucs.toFixed(0)}</TableCell>
                                <TableCell className="text-right text-emerald-400">{formatCurrency(item.cost)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Separator className="my-4 bg-gray-700" />
                
                <div className="px-4">
                    <h4 className="font-bold text-white mb-2">{t_calc('indirectCosts.title')}</h4>
                      {results.indirectBreakdown.map(item => (
                          <div key={item.category} className="flex justify-between items-center text-sm font-mono text-gray-300">
                              <p className="font-sans">{indirectCostCategories[item.category]}</p>
                              <p className="text-emerald-400">{formatCurrency(item.cost)}</p>
                          </div>
                      ))}
                </div>

                <Separator className="my-4 bg-gray-700" />
                
                <h4 className="font-headline text-lg text-white mb-4 px-4">{t_report('summaryTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 px-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t_report('totals.directUCScost')}</span>
                            <span className="font-mono font-medium text-white">{formatCurrency(results.directCost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t_report('totals.indirectUCScost')}</span>
                            <span className="font-mono font-medium text-white">{formatCurrency(results.indirectCost)}</span>
                        </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">{t_report('totals.costPerParticipantDay')}</span>
                            <span className="font-mono font-medium text-white">{formatCurrency(results.costPerParticipantDay)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t_report('totals.costPerParticipantHour')}</span>
                            <span className="font-mono font-medium text-white">{formatCurrency(results.costPerParticipantHour)}</span>
                        </div>
                    </div>
                    <div className="space-y-2 text-right md:text-right self-end">
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-400 text-base">{t_report('totals.totalToCompensate')}</span>
                            <span className="font-mono font-bold text-lg text-amber-400">{results.totalUCS.toFixed(0)} UCS</span>
                        </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-400 text-base">{t_report('totals.totalBudget')}</span>
                            <span className="font-mono font-bold text-lg text-emerald-400">{formatCurrency(results.totalCost)}</span>
                        </div>
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
