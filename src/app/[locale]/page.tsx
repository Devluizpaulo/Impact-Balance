"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import ImpactCalculator from "@/components/impact-calculator";
import type { CalculationResult, FormData } from "@/lib/types";
import { useTranslations } from "next-intl";
import ExecutiveReport from "@/components/executive-report";
import AppShell from "@/components/layout/app-shell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export default function Home() {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const t = useTranslations("HomePage");

  const handleCalculation = (data: CalculationResult, formData: FormData) => {
    setResults(data);
    setFormData(formData);
    setIsReportOpen(true);
  };
  
  const handleReset = () => {
    setResults(null);
    setFormData(null);
    setIsReportOpen(false);
  }

  return (
    <AppShell>
       <div className="space-y-4 max-w-4xl mx-auto">
          <ImpactCalculator onCalculate={handleCalculation} onReset={handleReset} />
      </div>

       {results && formData && (
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
              <div className="flex-grow overflow-y-auto pr-6">
                <ExecutiveReport results={results} formData={formData} />
              </div>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}
