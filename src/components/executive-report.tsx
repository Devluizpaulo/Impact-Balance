
"use client";

import type { CalculationResult, FormData } from "@/lib/types";
import ImpactCharts from "./impact-charts";
import ExportButtons from "@/components/export-buttons";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

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
      <div id="executive-report" className="bg-card text-card-foreground p-6 rounded-lg h-full relative flex flex-col">
          <div className="absolute inset-0 flex justify-center pointer-events-none pt-20">
              <Image 
                  src="/selo.png" 
                  alt="Selo de Certificação"
                  width={600}
                  height={600}
                  className="opacity-5"
              />
          </div>
          <div id="report-content-for-export" className="flex-grow space-y-6 z-10">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold font-headline text-foreground">{t_report('title')}</h3>
                  <p className="text-muted-foreground">{t_report('forEvent')} <span className="font-semibold text-primary">{formData.eventName}</span></p>
                </div>
                <ExportButtons results={results} formData={formData} />
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t_report('introduction')}
            </p>
            
            <div className="rounded-lg border bg-background/30 p-4">
                <h4 className="font-headline text-lg text-foreground mb-4">{t_report('breakdownTitle')}</h4>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-muted/50">
                            <TableHead className="text-foreground">{t_report('table.participants')}</TableHead>
                            <TableHead className="text-right text-foreground">{t_report('table.quantity')}</TableHead>
                            <TableHead className="text-right text-foreground">{t_report('table.duration')}</TableHead>
                            <TableHead className="text-right text-foreground">{t_report('table.totalUCS')}</TableHead>
                            <TableHead className="text-right text-foreground">{t_report('table.directCost')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.breakdown.map((item) => (
                            <TableRow key={item.category} className="font-mono hover:bg-muted/50">
                                <TableCell className="font-sans font-medium text-foreground/90">{participantCategories[item.category] || item.category}</TableCell>
                                <TableCell className="text-right text-foreground/90">{item.quantity}</TableCell>
                                <TableCell className="text-right text-foreground/90">{item.duration} <span className="text-xs text-muted-foreground">{t_calc(`participants.${item.durationUnit}` as any)}</span></TableCell>
                                <TableCell className="text-right text-primary font-semibold">{item.ucs.toFixed(2)}</TableCell>
                                <TableCell className="text-right text-primary/90 font-semibold">{formatCurrency(item.cost)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Separator className="my-4" />
                
                <div className="px-4">
                    <h4 className="font-bold text-foreground mb-2">{t_calc('indirectCosts.title')}</h4>
                      {results.indirectBreakdown.map(item => (
                          <div key={item.category} className="flex justify-between items-center text-sm font-mono text-foreground/90">
                              <p className="font-sans">{indirectCostCategories[item.category]}</p>
                              <p className="font-semibold text-primary/90">{formatCurrency(item.cost)}</p>
                          </div>
                      ))}
                </div>

                <Separator className="my-4" />
                
                <h4 className="font-headline text-lg text-foreground mb-4 px-4">{t_report('summaryTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 px-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t_report('totals.directUCScost')}</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrency(results.directCost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t_report('totals.indirectUCScost')}</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrency(results.indirectCost)}</span>
                        </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t_report('totals.costPerParticipantDay')}</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrency(results.costPerParticipantDay)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t_report('totals.costPerParticipantHour')}</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrency(results.costPerParticipantHour)}</span>
                        </div>
                    </div>
                    <div className="space-y-2 text-right md:text-right self-end">
                          <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground text-base">{t_report('totals.totalToCompensate')}</span>
                            <span className="font-mono font-bold text-lg text-primary">{results.totalUCS.toFixed(2)} UCS</span>
                        </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground text-base">{t_report('totals.totalBudget')}</span>
                            <span className="font-mono font-bold text-lg text-primary">{formatCurrency(results.totalCost)}</span>
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

    