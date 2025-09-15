"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formSchema, type FormData, type CalculationResult } from "@/lib/types";
import { UCS_FACTORS, UCS_COST_PER_UNIT, GDP_PER_CAPITA_BRAZIL } from "@/lib/constants";
import { Calculator, Users, Clock, CalendarDays, Maximize, Route, Trash2, Droplets, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

interface ImpactCalculatorProps {
  onCalculate: (data: CalculationResult, formData: FormData) => void;
  onReset: () => void;
}

export default function ImpactCalculator({ onCalculate, onReset }: ImpactCalculatorProps) {
  const t = useTranslations('ImpactCalculator');
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      eventName: "",
      visitors: 100,
      operators: 20,
      durationHours: 8,
      durationDays: 3,
      venueSizeSqm: 500,
      travelKm: 250,
      wasteKg: 150,
      waterLiters: 5000,
      energyKwh: 1200,
      currentPractices: "",
    },
  });

  function onSubmit(values: FormData) {
    const totalParticipants = values.visitors + values.operators;
    
    // Impact is proportional to the time spent. Visitors stay for hours, operators for days.
    // We can normalize this by converting days to hours (assuming 8h/day for operators)
    const operatorHours = values.operators * values.durationDays * 8;
    const visitorHours = values.visitors * values.durationHours;
    const totalParticipantHours = operatorHours + visitorHours;
    
    const participantFactor = totalParticipantHours * UCS_FACTORS.participants;

    const breakdown = [
      { category: "Participants", value: participantFactor, factor: 1 }, // Already factored in
      { category: "Duration", value: values.durationDays, factor: UCS_FACTORS.durationDays },
      { category: "Venue Size", value: values.venueSizeSqm, factor: UCS_FACTORS.venueSizeSqm },
      { category: "Travel", value: values.travelKm, factor: UCS_FACTORS.travelKm },
      { category: "Waste", value: values.wasteKg, factor: UCS_FACTORS.wasteKg },
      { category: "Water", value: values.waterLiters, factor: UCS_FACTORS.waterLiters },
      { category: "Energy", value: values.energyKwh, factor: UCS_FACTORS.energyKwh },
    ]
      .map(item => ({
        category: item.category,
        ucs: (item.value || 0) * item.factor,
        cost: (item.value || 0) * item.factor * UCS_COST_PER_UNIT,
      }));

    const totalUCS = breakdown.reduce((acc, item) => acc + item.ucs, 0);
    const totalCost = totalUCS * UCS_COST_PER_UNIT;
    const totalEventHours = values.durationDays * 24;

    const results: CalculationResult = {
      totalUCS,
      totalCost,
      ucsPerParticipant: totalParticipants > 0 ? totalUCS / totalParticipants : 0,
      costPerParticipant: totalParticipants > 0 ? totalCost / totalParticipants : 0,
      breakdown,
      equivalences: {
        dailyUCS: totalEventHours > 0 ? totalUCS / values.durationDays : 0,
        hourlyUCS: totalEventHours > 0 ? totalUCS / totalEventHours : 0,
        gdpPercentage: (totalCost / GDP_PER_CAPITA_BRAZIL) * 100,
      },
    };

    onCalculate(results, values);
  }

  const handleResetClick = () => {
    form.reset();
    onReset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><Calculator className="mr-2" /> {t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventName.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('eventName.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Users className="w-4 h-4 mr-2" />{t('visitors.label')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Clock className="w-4 h-4 mr-2" />{t('durationHours.label')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="operators"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Users className="w-4 h-4 mr-2" />{t('operators.label')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" />{t('durationDays.label')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <p className="text-sm text-muted-foreground">{t('optionalDetails')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="venueSizeSqm" render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center"><Maximize className="w-4 h-4 mr-2" />{t('venueSizeSqm.label')}</FormLabel><FormControl><Input type="number" placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="travelKm" render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center"><Route className="w-4 h-4 mr-2" />{t('travelKm.label')}</FormLabel><FormControl><Input type="number" placeholder="250" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="wasteKg" render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center"><Trash2 className="w-4 h-4 mr-2" />{t('wasteKg.label')}</FormLabel><FormControl><Input type="number" placeholder="150" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="waterLiters" render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center"><Droplets className="w-4 h-4 mr-2" />{t('waterLiters.label')}</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="energyKwh" render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center"><Zap className="w-4 h-4 mr-2" />{t('energyKwh.label')}</FormLabel><FormControl><Input type="number" placeholder="1200" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <FormField
              control={form.control}
              name="currentPractices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currentPractices.label')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('currentPractices.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleResetClick}>
                {t('resetButton')}
              </Button>
              <Button type="submit">{t('calculateButton')}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
