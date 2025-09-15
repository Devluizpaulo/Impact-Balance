"use client";

import type { CalculationResult, FormData } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, HandHelping, ListTree } from "lucide-react";
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

    return (
        <Tabs defaultValue="summary">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <TabsList>
                    <TabsTrigger value="summary"><ListTree className="mr-2 h-4 w-4" />{t('tabs.summary')}</TabsTrigger>
                    <TabsTrigger value="charts"><BarChart className="mr-2 h-4 w-4" />{t('tabs.charts')}</TabsTrigger>
                    <TabsTrigger value="ai-suggestions"><HandHelping className="mr-2 h-4 w-4" />{t('tabs.aiSuggestions')}</TabsTrigger>
                </TabsList>
                <ExportButtons results={results} formData={formData} />
            </div>
            <TabsContent value="summary">
                <h3 className="text-2xl font-bold mb-4 font-headline">{t('summary.title')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('summary.totalUCS')}</p>
                        <p className="text-2xl font-bold">{results.totalUCS.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('summary.totalCost')}</p>
                        <p className="text-2xl font-bold">${results.totalCost.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('summary.ucsPerParticipant')}</p>
                        <p className="text-2xl font-bold">{results.ucsPerParticipant.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('summary.costPerParticipant')}</p>
                        <p className="text-2xl font-bold">${results.costPerParticipant.toFixed(2)}</p>
                    </div>
                </div>

                <h4 className="text-xl font-bold mt-8 mb-4 font-headline">{t('summary.equivalencesTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('summary.dailyUCS')}</p>
                        <p className="text-xl font-semibold">{results.equivalences.dailyUCS.toFixed(2)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('summary.hourlyUCS')}</p>
                        <p className="text-xl font-semibold">{results.equivalences.hourlyUCS.toFixed(2)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('summary.gdpPercentage')}</p>
                        <p className="text-xl font-semibold">{results.equivalences.gdpPercentage.toFixed(4)}%</p>
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
    );
}
