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
import { Calculator, Users, Clock, CalendarDays, Maximize, Route, Trash2, Droplets, Zap, User, UserCog, Wrench, Building2, Headset, Briefcase, Handshake } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/settings";

interface ImpactCalculatorProps {
  onCalculate: (data: CalculationResult, formData: FormData) => void;
  onReset: () => void;
}

export default function ImpactCalculator({ onCalculate, onReset }: ImpactCalculatorProps) {
  const t = useTranslations('ImpactCalculator');
  const { settings } = useSettings();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      eventName: "",
      participants: {
        organizers: 10,
        assemblers: 100,
        suppliers: 100,
        exhibitors: 150,
        supportTeam: 1000,
        attendants: 200,
        support: 300,
        visitors: 4500,
      },
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
    const { ucsFactors, ucsCostPerUnit, equivalences, perCapitaFactors } = settings;
    const { participants, durationDays, durationHours } = values;

    const staffParticipants =
      (participants.organizers || 0) +
      (participants.assemblers || 0) +
      (participants.suppliers || 0) +
      (participants.exhibitors || 0) +
      (participants.supportTeam || 0) +
      (participants.attendants || 0) +
      (participants.support || 0);

    const visitorParticipants = participants.visitors || 0;
    const totalParticipants = staffParticipants + visitorParticipants;
    
    const staffHours = staffParticipants * durationDays * 8; // Staff works 8 hours/day
    const visitorHours = visitorParticipants * durationHours;
    const totalParticipantHours = staffHours + visitorHours;
    
    const participantUcs = totalParticipantHours * perCapitaFactors.hourlyUcsConsumption;

    const breakdown = [
      {
        category: "Participants",
        ucs: participantUcs,
        cost: participantUcs * ucsCostPerUnit,
      },
      {
        category: "Duration",
        ucs: (values.durationDays || 0) * ucsFactors.durationDays,
        cost: ((values.durationDays || 0) * ucsFactors.durationDays) * ucsCostPerUnit,
      },
      {
        category: "Venue Size",
        ucs: (values.venueSizeSqm || 0) * ucsFactors.venueSizeSqm,
        cost: ((values.venueSizeSqm || 0) * ucsFactors.venueSizeSqm) * ucsCostPerUnit,
      },
      {
        category: "Travel",
        ucs: (values.travelKm || 0) * ucsFactors.travelKm,
        cost: ((values.travelKm || 0) * ucsFactors.travelKm) * ucsCostPerUnit,
      },
      {
        category: "Waste",
        ucs: (values.wasteKg || 0) * ucsFactors.wasteKg,
        cost: ((values.wasteKg || 0) * ucsFactors.wasteKg) * ucsCostPerUnit,
      },
      {
        category: "Water",
        ucs: (values.waterLiters || 0) * ucsFactors.waterLiters,
        cost: ((values.waterLiters || 0) * ucsFactors.waterLiters) * ucsCostPerUnit,
      },
      {
        category: "Energy",
        ucs: (values.energyKwh || 0) * ucsFactors.energyKwh,
        cost: ((values.energyKwh || 0) * ucsFactors.energyKwh) * ucsCostPerUnit,
      },
    ];

    const totalUCS = breakdown.reduce((acc, item) => acc + item.ucs, 0);
    const totalCost = totalUCS * ucsCostPerUnit;
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
        gdpPercentage: (totalCost / equivalences.gdpPerCapita) * 100,
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
            
            <Separator />
            <p className="font-medium">{t('participants.title')}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="participants.organizers" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><UserCog />{t('participants.organizers')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="participants.assemblers" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Wrench />{t('participants.assemblers')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="participants.suppliers" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Briefcase />{t('participants.suppliers')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="participants.exhibitors" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Building2 />{t('participants.exhibitors')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="participants.supportTeam" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Headset />{t('participants.supportTeam')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormMessage /></FormItem>)} />
              <FormField control={form.control} name="participants.attendants" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><User />{t('participants.attendants')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormMessage /></FormItem>)} />
              <FormField control={form.control} name="participants.support" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Handshake />{t('participants.support')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormMessage /></FormItem>)} />
              <FormField control={form.control} name="participants.visitors" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Users />{t('participants.visitors')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormMessage /></FormItem>)} />
            </div>

            <Separator />
            <p className="font-medium">{t('durationTitle')}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
