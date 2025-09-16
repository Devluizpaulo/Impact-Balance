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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formSchema, type FormData, type CalculationResult } from "@/lib/types";
import { Calculator, Users, Clock, UserCog, Wrench, Briefcase, Building2, Headset, User, Handshake, FileText, Award, Globe, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/settings";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImpactCalculatorProps {
  onCalculate: (data: CalculationResult, formData: FormData) => void;
  onReset: () => void;
}

export default function ImpactCalculator({ onCalculate, onReset }: ImpactCalculatorProps) {
  const t = useTranslations('ImpactCalculator');
  const { settings } = useSettings();
  const [visitorUnit, setVisitorUnit] = useState<'hours' | 'days'>('hours');
  
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
        count: undefined,
        unit: 'hours',
        hours: undefined,
        days: undefined,
      },
      indirectCosts: {
        ownershipRegistration: undefined,
        certificateIssuance: undefined,
        websitePage: undefined,
      }
    },
  });

 function onSubmit(values: FormData) {
    const { ucsCostPerUnit, perCapitaFactors, equivalences } = settings;
    const { participants, visitors, indirectCosts } = values;

    const breakdown: { category: string; ucs: number; cost: number, quantity: number, duration: number, durationUnit: 'days' | 'hours' }[] = [];
    let totalParticipantsCount = 0;

    // Calculate staff UCS
    Object.entries(participants).forEach(([key, p]) => {
      const count = p?.count || 0;
      const days = p?.days || 0;
      if (count > 0 && days > 0) {
        totalParticipantsCount += count;
        const ucs = count * days * perCapitaFactors.dailyUcsConsumption;
        breakdown.push({
          category: key,
          ucs,
          cost: ucs * equivalences.ucsQuotationValue,
          quantity: count,
          duration: days,
          durationUnit: 'days',
        });
      }
    });

    // Calculate visitor UCS
    const visitorCount = visitors?.count || 0;
    if (visitorCount > 0) {
      totalParticipantsCount += visitorCount;
      if (visitors?.unit === 'days') {
        const visitorDays = visitors?.days || 0;
        const ucs = visitorCount * visitorDays * perCapitaFactors.dailyUcsConsumption;
        breakdown.push({
          category: 'visitors',
          ucs,
          cost: ucs * equivalences.ucsQuotationValue,
          quantity: visitorCount,
          duration: visitorDays,
          durationUnit: 'days'
        });
      } else {
        const visitorHours = visitors?.hours || 0;
        const ucs = visitorCount * visitorHours * (perCapitaFactors.dailyUcsConsumption / 8); // Assuming 8-hour day
        breakdown.push({
          category: 'visitors',
          ucs,
          cost: ucs * equivalences.ucsQuotationValue,
          quantity: visitorCount,
          duration: visitorHours,
          durationUnit: 'hours'
        });
      }
    }

    // Indirect Costs
    const indirectBreakdown: { category: string; ucs: number; cost: number }[] = [];
    if (indirectCosts) {
      if ((indirectCosts.ownershipRegistration || 0) > 0) {
        const cost = indirectCosts.ownershipRegistration!;
        const ucs = cost / ucsCostPerUnit;
        indirectBreakdown.push({ category: "ownershipRegistration", ucs, cost });
      }
      if ((indirectCosts.certificateIssuance || 0) > 0) {
        const cost = indirectCosts.certificateIssuance!;
        const ucs = cost / ucsCostPerUnit;
        indirectBreakdown.push({ category: "certificateIssuance", ucs, cost });
      }
      if ((indirectCosts.websitePage || 0) > 0) {
        const cost = indirectCosts.websitePage!;
        const ucs = cost / ucsCostPerUnit;
        indirectBreakdown.push({ category: "websitePage", ucs, cost });
      }
    }
    
    const directUcs = breakdown.reduce((acc, item) => acc + item.ucs, 0);
    const directCost = breakdown.reduce((acc, item) => acc + item.cost, 0);
    
    const indirectUcs = indirectBreakdown.reduce((acc, item) => acc + item.ucs, 0);
    const indirectCost = indirectBreakdown.reduce((acc, item) => acc + item.cost, 0);
    
    const totalUCS = directUcs + indirectUcs;
    const totalCost = directCost + indirectCost;

    const maxDays = Math.max(
      ...Object.values(participants).map(p => p?.days || 0),
      (visitors?.unit === 'days' ? (visitors.days || 0) : (visitors?.hours || 0) / 8)
    );
    const totalEventHours = maxDays > 0 ? maxDays * 24 : 0;

    const results: CalculationResult = {
      totalUCS,
      totalCost,
      directUcs,
      directCost,
      indirectUcs,
      indirectCost,
      ucsPerParticipant: totalParticipantsCount > 0 ? totalUCS / totalParticipantsCount : 0,
      costPerParticipant: totalParticipantsCount > 0 ? totalCost / totalParticipantsCount : 0,
      breakdown,
      indirectBreakdown,
      equivalences: {
        dailyUCS: maxDays > 0 ? totalUCS / maxDays : 0,
        hourlyUCS: totalEventHours > 0 ? totalUCS / totalEventHours : 0,
        gdpPercentage: settings.equivalences.gdpPerCapita > 0 ? (totalCost / settings.equivalences.gdpPerCapita) * 100 : 0,
      },
    };

    onCalculate(results, values);
  }

  const handleResetClick = () => {
    form.reset({
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
        count: undefined,
        unit: 'hours',
        hours: undefined,
        days: undefined,
      },
      indirectCosts: {
        ownershipRegistration: undefined,
        certificateIssuance: undefined,
        websitePage: undefined,
      }
    });
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
  
  const ParticipantField = ({ name, icon, label }: { name: keyof FormData['participants'], icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-normal w-48 flex-shrink-0">
        {icon} {label}
      </div>
      <div className="grid grid-cols-2 gap-2 w-full">
        <FormField
          control={form.control}
          name={`participants.${name}.count`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="number" placeholder={t('participants.quantity')} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
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
              <FormControl>
                <Input type="number" placeholder={t('participants.days')} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

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
            <div className="space-y-4">
              <div className='flex items-center gap-4'>
                <p className="font-medium text-sm w-48 flex-shrink-0">{t('participants.staffTitle')}</p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <p className="font-medium text-sm text-muted-foreground">{t('participants.quantity')}</p>
                  <p className="font-medium text-sm text-muted-foreground">{t('participants.days')}</p>
                </div>
              </div>

              <div className="space-y-3">
                  <ParticipantField name="organizers" icon={<UserCog className="w-5 h-5"/>} label={t('participants.organizersAndPromoters')} />
                  <ParticipantField name="assemblers" icon={<Wrench className="w-5 h-5"/>} label={t('participants.assemblers')} />
                  <ParticipantField name="suppliers" icon={<Briefcase className="w-5 h-5"/>} label={t('participants.suppliers')} />
                  <ParticipantField name="exhibitors" icon={<Building2 className="w-5 h-5"/>} label={t('participants.exhibitors')} />
                  <ParticipantField name="supportTeam" icon={<Headset className="w-5 h-5"/>} label={t('participants.supportTeam')} />
                  <ParticipantField name="attendants" icon={<User className="w-5 h-5"/>} label={t('participants.attendants')} />
                  <ParticipantField name="support" icon={<Handshake className="w-5 h-5"/>} label={t('participants.support')} />
              </div>
            </div>
            
            <Separator />
            <p className="font-medium">{t('participants.visitorsTitle')}</p>
            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
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


            <Separator />
            <p className="font-medium">{t('indirectCosts.title')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="indirectCosts.ownershipRegistration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><FileText className="w-4 h-4 mr-2" />{t('indirectCosts.ownershipRegistration')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="indirectCosts.certificateIssuance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Award className="w-4 h-4 mr-2" />{t('indirectCosts.certificateIssuance')}</FormLabel>
                    <FormControl>
                       <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="indirectCosts.websitePage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Globe className="w-4 h-4 mr-2" />{t('indirectCosts.websitePage')}</FormLabel>
                     <FormControl>
                       <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="no-spinner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
