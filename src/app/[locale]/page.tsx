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
  };
  
  const handleReset = () => {
    setResults(null);
    setFormData(null);
  }

  return (
    <AppShell>
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

      <div className="container mx-auto px-4 py-8 md:py-12 mb-16 md:mb-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div className="xl:col-span-1">
            <ImpactCalculator onCalculate={handleCalculation} onReset={handleReset} />
          </div>
          <div className="xl:col-span-1">
            <Card className="h-full min-h-[600px] sticky top-20" id="report-content">
              <CardContent className="p-6">
                {results && formData ? (
                  <ExecutiveReport results={results} formData={formData} />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-[500px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground opacity-50"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3-3 3 3"></path></svg>
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
    </AppShell>
  );
}
