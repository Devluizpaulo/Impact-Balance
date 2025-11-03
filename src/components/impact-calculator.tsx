
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formSchema, type FormData, type CalculationResult, type Benefits } from "@/lib/types";
import { defaultSettings } from "@/lib/settings";
import { Calculator, Users, Clock, UserCog, Wrench, Briefcase, Building2, Headset, User, Handshake, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/settings";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { addEvent } from "@/lib/event-storage";
import { useToast } from "@/hooks/use-toast";


interface ImpactCalculatorProps {
  onCalculate: (data: CalculationResult, formData: FormData) => void;
  onReset: () => void;
}

// Moved ParticipantField outside of ImpactCalculator to prevent re-renders and focus loss
const ParticipantField = ({ name, icon, label, t, form }: { name: keyof FormData['participants'], icon: React.ReactNode, label: string, t: (key: string) => string, form: UseFormReturn<FormData> }) => (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] items-center gap-2 md:gap-4 border-b border-border/50 pb-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon} {label}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
        <FormField
          control={form.control}
          name={`participants.${name}.count`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground sm:hidden">{t('participants.quantity')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('participants.quantity')}
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}
                  value={field.value ?? ''}
                  className="no-spinner"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`participants.${name}.days`}
          render={({ field }) => (
            <FormItem>
               <FormLabel className="text-xs text-muted-foreground sm:hidden">{t('participants.days')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('participants.days')}
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}
                  value={field.value ?? ''}
                  className="no-spinner"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

// Helper function to recursively replace undefined with null
// Firestore doesn't support `undefined` values.
const cleanupUndefined = (obj: unknown): unknown => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map((item) => cleanupUndefined(item));
  if (typeof obj === 'object') {
    const source = obj as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        out[key] = cleanupUndefined(source[key]);
      }
    }
    return out;
  }
  return obj;
};


export default function ImpactCalculator({ onCalculate, onReset }: ImpactCalculatorProps) {
  const t = useTranslations('ImpactCalculator');
  const { settings } = useSettings();
  const [visitorUnit, setVisitorUnit] = useState<'hours' | 'days'>('hours');
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      eventName: "",
      participants: {
        organizers: { count: undefined, days: undefined },
        assemblers: { count: undefined, days: undefined },
        suppliers: { count: undefined, days: undefined },
        exhibitors: { count: undefined, days: undefined },
        supportTeam: { count: undefined, days: undefined },
        attendants: { count: undefined, days: undefined },
        support: { count: undefined, days: undefined },
      },
      visitors: {
        unit: 'hours',
        count: undefined,
        hours: undefined,
        days: undefined,
      },
    },
  });

 async function onSubmit(values: FormData) {
    const { calculation } = settings;
    const { participants, visitors } = values;

    const breakdown: { category: string; ucs: number; cost: number, quantity: number, duration: number, durationUnit: 'days' | 'hours' }[] = [];
    let totalParticipantsValue = 0;
    const quotationValue = calculation.equivalences.ucsQuotationValue > 0
      ? calculation.equivalences.ucsQuotationValue
      : defaultSettings.calculation.equivalences.ucsQuotationValue;
    
    // Calculate staff UCS (by days)
    Object.entries(participants).forEach(([key, p]) => {
      const participantData = p as { count?: number; days?: number };
      const count = participantData.count || 0;
      const days = participantData.days || 0;

      if (count > 0 && days > 0) {
        totalParticipantsValue += count;
        const rawUcs = count * days * calculation.perCapitaFactors.dailyUcsConsumption;
        const ucs = Math.ceil(rawUcs);
        
        breakdown.push({
          category: key,
          ucs: ucs, 
          cost: ucs * quotationValue,
          quantity: count,
          duration: days,
          durationUnit: 'days',
        });
      }
    });

    // Calculate visitor UCS (by hours or days)
    const visitorCount = visitors?.count || 0;
    if (visitorCount > 0 && visitors) {
        totalParticipantsValue += visitorCount;
        let ucs = 0;
        let duration = 0;
        let durationUnit: 'days' | 'hours' = 'hours';

        if (visitors.unit === 'days') {
            duration = visitors.days || 0;
            durationUnit = 'days';
            if (duration > 0) {
                const rawUcs = visitorCount * duration * calculation.perCapitaFactors.dailyUcsConsumption;
                ucs = Math.ceil(rawUcs);
            }
        } else { // hours
            duration = visitors.hours || 0;
            durationUnit = 'hours';
            if (duration > 0) {
                 const personHours = visitorCount * duration;
                 ucs = Math.ceil(personHours / 14);
            }
        }
        
        if (ucs > 0) {
            breakdown.push({
                category: 'visitors',
                ucs: ucs,
                cost: ucs * quotationValue,
                quantity: visitorCount,
                duration: duration,
                durationUnit: durationUnit,
            });
        }
    }
    
    const directUcs = breakdown.reduce((acc, item) => acc + item.ucs, 0);
    const directCost = breakdown.reduce((acc, item) => acc + item.cost, 0);
    
    // Calculate indirect costs
    const indirectBreakdown: { category: string; cost: number }[] = [];
    const ownershipRegistrationCost = directCost * (calculation.indirectCosts.ownershipRegistration / 100);
    
    indirectBreakdown.push({ category: "ownershipRegistration", cost: ownershipRegistrationCost });
    indirectBreakdown.push({ category: "certificateIssuance", cost: calculation.indirectCosts.certificateIssuance });
    indirectBreakdown.push({ category: "websitePage", cost: calculation.indirectCosts.websitePage });
    
    const indirectCost = indirectBreakdown.reduce((acc, item) => acc + item.cost, 0);
    
    const totalCost = directCost + indirectCost;
    const totalUCS = directUcs;
    
    // Calculate total participant duration for averages
    let totalParticipantDays = 0;
    let totalParticipantHours = 0;

    Object.entries(participants).forEach(([, p]) => {
      const data = p as { count?: number; days?: number };
      if (data.count && data.days) {
        totalParticipantDays += data.count * data.days;
        totalParticipantHours += data.count * data.days * 8; // Assuming 8-hour day
      }
    });

    if (visitors && visitors.count) {
      if (visitors.unit === 'days' && visitors.days) {
        totalParticipantDays += visitors.count * visitors.days;
        totalParticipantHours += visitors.count * visitors.days * 8;
      } else if (visitors.unit === 'hours' && visitors.hours) {
        totalParticipantHours += visitors.count * visitors.hours;
        totalParticipantDays += (visitors.count * visitors.hours) / 8;
      }
    }


    // Calculate benefits based on total UCS
    const benefits: Benefits = {
        preservedNativeForestArea: totalUCS * calculation.benefits.preservedNativeForestArea,
        carbonEmissionAvoided: totalUCS * calculation.benefits.carbonEmissionAvoided,
        storedWood: totalUCS * calculation.benefits.storedWood,
        faunaSpeciesPreservation: totalUCS * calculation.benefits.faunaSpeciesPreservation,
        floraSpeciesPreservation: totalUCS * calculation.benefits.floraSpeciesPreservation,
        hydrologicalFlowPreservation: totalUCS * calculation.benefits.hydrologicalFlowPreservation,
    };

    const maxDays = Math.max(
      ...Object.values(participants).map(p => (p as {days?: number})?.days || 0),
      (visitors?.unit === 'days' ? (visitors.days || 0) : (visitors?.hours || 0) / 8)
    );
    const totalEventHours = maxDays > 0 ? maxDays * 24 : 0;
    
    const results: CalculationResult = {
      totalParticipants: totalParticipantsValue,
      totalUCS,
      totalCost,
      totalCostUSD: totalUCS * (settings.calculation.equivalences.ucsQuotationValueUSD || 0),
      totalCostEUR: totalUCS * (settings.calculation.equivalences.ucsQuotationValueEUR || 0),
      directUcs,
      directCost,
      indirectCost,
      ucsPerParticipant: totalParticipantsValue > 0 ? totalUCS / totalParticipantsValue : 0,
      costPerParticipant: totalParticipantsValue > 0 ? totalCost / totalParticipantsValue : 0,
      costPerParticipantDay: totalParticipantDays > 0 ? totalCost / totalParticipantDays : 0,
      costPerParticipantHour: totalParticipantHours > 0 ? totalCost / totalParticipantHours : 0,
      breakdown,
      indirectBreakdown,
      equivalences: {
        dailyUCS: maxDays > 0 ? totalUCS / maxDays : 0,
        hourlyUCS: totalEventHours > 0 ? totalUCS / totalEventHours : 0,
        gdpPercentage: calculation.equivalences.gdpPerCapita > 0 ? (totalCost / calculation.equivalences.gdpPerCapita) * 100 : 0,
      },
      benefits,
    };

    const cleanedValues = cleanupUndefined(values) as FormData;

    await addEvent({
      formData: cleanedValues,
      results
    });

    onCalculate(results, cleanedValues);
  }


  const handleResetClick = () => {
    form.reset();
    setVisitorUnit('hours');
    onReset();
  }

  const handleUnitChange = (unit: 'hours' | 'days') => {
    setVisitorUnit(unit);
    form.setValue('visitors.unit', unit);
    if (unit === 'hours') {
      form.setValue('visitors.days', undefined);
    } else {
      form.setValue('visitors.hours', undefined);
    }
  }
  
  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
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
            <div className="space-y-4">
              <div className='hidden md:grid md:grid-cols-[1fr_2fr] items-center gap-4'>
                <p className="font-medium text-sm">{t('participants.staffTitle')}</p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <p className="font-medium text-sm text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/>{t('participants.quantity')}</p>
                  <p className="font-medium text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4"/>{t('participants.days')}</p>
                </div>
              </div>
               <p className="font-medium text-sm md:hidden">{t('participants.staffTitle')}</p>

              <div className="space-y-4">
                  <ParticipantField form={form} name="organizers" icon={<UserCog className="w-5 h-5"/>} label={t('participants.organizersAndPromoters')} t={t}/>
                  <ParticipantField form={form} name="assemblers" icon={<Wrench className="w-5 h-5"/>} label={t('participants.assemblers')} t={t}/>
                  <ParticipantField form={form} name="suppliers" icon={<Briefcase className="w-5 h-5"/>} label={t('participants.suppliers')} t={t}/>
                  <ParticipantField form={form} name="exhibitors" icon={<Building2 className="w-5 h-5"/>} label={t('participants.exhibitors')} t={t}/>
                  <ParticipantField form={form} name="supportTeam" icon={<Headset className="w-5 h-5"/>} label={t('participants.supportTeam')} t={t}/>
                  <ParticipantField form={form} name="attendants" icon={<User className="w-5 h-5"/>} label={t('participants.attendants')} t={t}/>
                  <ParticipantField form={form} name="support" icon={<Handshake className="w-5 h-5"/>} label={t('participants.support')} t={t}/>
              </div>
            </div>
            
            <Separator />
            <p className="font-medium">{t('participants.visitorsTitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
              <FormField
                control={form.control}
                name="visitors.count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Users className="w-5 h-5"/>{t('participants.quantity')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('participants.quantity')} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>{t('participants.durationUnit')}</FormLabel>
                <Tabs defaultValue={visitorUnit} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2 h-10">
                        <TabsTrigger value="hours" onClick={() => handleUnitChange('hours')}><Clock className="mr-2 w-5 h-5"/> {t('participants.hours')}</TabsTrigger>
                        <TabsTrigger value="days" onClick={() => handleUnitChange('days')}><CalendarDays className="mr-2 w-5 h-5"/> {t('participants.days')}</TabsTrigger>
                    </TabsList>
                </Tabs>
              </div>
            </div>

            <FormField
              control={form.control}
              name="visitors.hours"
              render={({ field }) => (
                <FormItem className={cn(visitorUnit === 'days' && 'hidden')}>
                  <FormLabel className="flex items-center gap-2"><Clock className="w-5 h-5"/>{t('participants.hours')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t('participants.hours')} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visitors.days"
              render={({ field }) => (
                <FormItem className={cn(visitorUnit === 'hours' && 'hidden')}>
                  <FormLabel className="flex items-center gap-2"><CalendarDays className="w-5 h-5"/>{t('participants.days')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t('participants.days')} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
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

  