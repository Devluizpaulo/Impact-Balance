"use client";

import Image from "next/image";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ImpactCalculator from "@/components/impact-calculator";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { CalculationResult, FormData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, HandHelping, ListTree } from "lucide-react";
import ImpactCharts from "@/components/impact-charts";
import AiSuggestions from "@/components/ai-suggestions";
import ExportButtons from "@/components/export-buttons";
import { useTranslations } from "next-intl";

export default function Home() {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const t = useTranslations("HomePage");

  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-background");

  const handleCalculation = (data: CalculationResult, formData: FormData) => {
    setResults(data);
    setFormData(formData);
  };
  
  const handleReset = () => {
    setResults(null);
    setFormData(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative h-80 text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="lg:col-span-1">
              <ImpactCalculator onCalculate={handleCalculation} onReset={handleReset} />
            </div>
            <div className="lg:col-span-1">
              <Card className="h-full min-h-[600px] sticky top-24">
                <CardContent className="p-6">
                  {results && formData ? (
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
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-[500px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground opacity-50"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                      <h3 className="mt-4 text-xl font-semibold text-muted-foreground">{t('awaitingData.title')}</h3>
                      <p className="mt-2 text-muted-foreground">
                        {t('awaitingData.description')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
