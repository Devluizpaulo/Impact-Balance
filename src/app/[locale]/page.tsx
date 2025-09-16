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
      <div className="flex min-h-screen flex-col bg-background">
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
                <Card className="h-full min-h-[600px] sticky top-24" id="report-content">
                  <CardContent className="p-6">
                    {results && formData ? (
                      <ExecutiveReport results={results} formData={formData} />
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
      </div>
    </AppShell>
  );
}
