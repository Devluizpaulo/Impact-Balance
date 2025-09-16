"use client";

import type { CalculationResult, FormData } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, HandHelping, ListTree, Users, Calendar, Clock, DollarSign } from "lucide-react";
import ImpactCharts from "@/components/impact-charts";
import AiSuggestions from "@/components/ai-suggestions";
import ExportButtons from "@/components/export-buttons";
import { useTranslations } from "next-intl";

interface ExecutiveReportProps {
    results: CalculationResult;
    formData: FormData;
}

export default function ExecutiveReport({ results, formData }: ExecutiveReportProps) {
    const t = useTranslations("HomePage");
    const t_calc = useTranslations("ImpactCalculator");

    const totalStaff = Object.values(formData.participants).reduce((acc, p) => acc + (p?.count || 0), 0);
    const totalVisitors = formData.visitors?.count || 0;
    const totalIndirectCosts = Object.values(formData.indirectCosts || {}).reduce((acc, c) => acc + (c || 0), 0);
    const maxDays = Math.max(
      ...Object.values(formData.participants).map(p => p?.days || 0),
      (formData.visitors?.unit === 'days' ? formData.visitors.days : (formData.visitors?.hours || 0) / 8) || 0
    );


    return (
      <div id="executive-report">
        <Tabs defaultValue="summary">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <TabsList className="bg-gray-800/60 text-gray-300 border-gray-700">
                    <TabsTrigger value="summary" className="data-[state=active]:bg-primary/80 data-[state=active]:text-white"><ListTree className="mr-2 h-4 w-4" />{t('tabs.summary')}</TabsTrigger>
                    <TabsTrigger value="charts" className="data-[state=active]:bg-primary/80 data-[state=active]:text-white"><BarChart className="mr-2 h-4 w-4" />{t('tabs.charts')}</TabsTrigger>
                    <TabsTrigger value="ai-suggestions" className="data-[state=active]:bg-primary/80 data-[state=active]:text-white"><HandHelping className="mr-2 h-4 w-4" />{t('tabs.aiSuggestions')}</TabsTrigger>
                </TabsList>
                <ExportButtons results={results} formData={formData} />
            </div>
            <TabsContent value="summary">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-1 font-headline text-white">{t('summary.title')}</h3>
                  <p className="text-gray-400">{t('summary.forEvent')} <span className="font-semibold text-primary">{formData.eventName}</span></p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-8">
                    <div className="p-4 bg-gray-800/60 rounded-lg">
                        <p className="text-sm text-gray-400">{t('summary.totalUCS')}</p>
                        <p className="text-3xl font-bold font-mono text-white">{results.totalUCS.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-800/60 rounded-lg">
                        <p className="text-sm text-gray-400">{t('summary.totalCost')}</p>
                        <p className="text-3xl font-bold font-mono text-white">${results.totalCost.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-800/60 rounded-lg">
                        <p className="text-sm text-gray-400">{t('summary.ucsPerParticipant')}</p>
                        <p className="text-3xl font-bold font-mono text-white">{results.ucsPerParticipant.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-800/60 rounded-lg">
                        <p className="text-sm text-gray-400">{t('summary.costPerParticipant')}</p>
                        <p className="text-3xl font-bold font-mono text-white">${results.costPerParticipant.toFixed(2)}</p>
                    </div>
                </div>

                <h4 className="text-xl font-bold mt-8 mb-4 font-headline text-white">{t('summary.calculationDetails')}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold text-white">{totalStaff}</p>
                            <p className="text-gray-400">{t_calc('participants.staffTitle')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold text-white">{totalVisitors}</p>
                            <p className="text-gray-400">{t_calc('participants.visitorsTitle')}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold font-mono text-white">${totalIndirectCosts.toFixed(2)}</p>
                            <p className="text-gray-400">{t_calc('indirectCosts.title')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold text-white">{maxDays.toFixed(1)} {t_calc('participants.days')}</p>
                            <p className="text-gray-400">{t('summary.eventDuration')}</p>
                        </div>
                    </div>
                </div>


                <h4 className="text-xl font-bold mt-8 mb-4 font-headline text-white">{t('summary.equivalencesTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">{t('summary.dailyUCS')}</p>
                        <p className="text-2xl font-semibold font-mono text-white">{results.equivalences.dailyUCS.toFixed(2)}</p>
                    </div>
                    <div className="p-4 border border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">{t('summary.hourlyUCS')}</p>
                        <p className="text-2xl font-semibold font-mono text-white">{results.equivalences.hourlyUCS.toFixed(2)}</p>
                    </div>
                    <div className="p-4 border border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">{t('summary.gdpPercentage')}</p>
                        <p className="text-2xl font-semibold font-mono text-white">{results.equivalences.gdpPercentage.toFixed(4)}%</p>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="charts">
                <ImpactCharts results={results} />
            </TabsContent>
            <TabsContent value="ai-suggestions">
                <AiSuggestions formData={formData} />
            </TabsContent>
        </Tabs>
      </div>
    );
}
