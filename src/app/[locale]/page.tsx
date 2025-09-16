"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import ImpactCalculator from "@/components/impact-calculator";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { CalculationResult, FormData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import ExecutiveReport from "@/components/executive-report";
import AppShell from "@/components/layout/app-shell";

export default function Home() {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const t = useTranslations("HomePage");
  const reportRef = useRef<HTMLDivElement>(null);

  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-background");

  const handleCalculation = (data: CalculationResult, formData: FormData) => {
    setResults(data);
    setFormData(formData);
    setTimeout(() => {
      document.getElementById('report-content')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleReset = () => {
    setResults(null);
    setFormData(null);
  }

  return (
    <AppShell>
       <div className="space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">{t('heroTitle')}</h2>
          </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div className="xl:col-span-1">
            <ImpactCalculator onCalculate={handleCalculation} onReset={handleReset} />
          </div>
          <div className="xl:col-span-1 sticky top-8">
            <Card className="h-full min-h-[600px] bg-gray-900 text-gray-100 border-gray-700" id="report-content">
              <CardContent className="p-6 h-full">
                {results && formData ? (
                  <ExecutiveReport results={results} formData={formData} />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-500 opacity-50"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3-3 3 3"></path></svg>
                    <h3 className="mt-4 text-xl font-semibold text-gray-500">{t('awaitingData.title')}</h3>
                    <p className="mt-2 text-gray-400">
                      {t('awaitingData.description')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
