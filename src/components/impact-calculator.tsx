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
import { Calculator, Users, Clock, CalendarDays, UserCog, Wrench, Briefcase, Building2, Headset, User, Handshake, FileText, Award, Globe } from "lucide-react";
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
        organizers: { count: 10, days: 20 },
        assemblers: { count: 100, days: 20 },
        suppliers: { count: 100, days: 20 },
        exhibitors: { count: 150, days: 20 },
        supportTeam: { count: 1000, days: 20 },
        attendants: { count: 200, days: 20 },
        support: { count: 300, days: 20 },
      },
      visitors: {
        count: 4500,
        hours: 3
      },
      indirectCosts: {
        ownershipRegistration: settings.indirectCosts.ownershipRegistration,
        certificateIssuance: settings.indirectCosts.certificateIssuance,
        websitePage: settings.indirectCosts.websitePage,
      }
    },
  });

  function onSubmit(values: FormData) {
    const { ucsCostPerUnit, equivalences, perCapitaFactors } = settings;
    const { participants, visitors, indirectCosts } = values;

    const breakdown: { category: string; ucs: number; cost: number }[] = [];
    
    let totalStaffParticipants = 0;
    let totalStaffHours = 0;

    Object.values(participants).forEach(p => {
      const count = p?.count || 0;
      const days = p?.days || 0;
      totalStaffParticipants += count;
      totalStaffHours += count * days * 8; // Assuming 8 hours per day
    });
    
    const visitorParticipants = visitors?.count || 0;
    const visitorHours = visitorParticipants * (visitors?.hours || 0);
    
    const participantUcs = (totalStaffHours + visitorHours) * perCapitaFactors.hourlyUcsConsumption;
    if (participantUcs > 0) {
      breakdown.push({
        category: "Participants",
        ucs: participantUcs,
        cost: participantUcs * ucsCostPerUnit,
      });
    }

    if (indirectCosts) {
      if ((indirectCosts.ownershipRegistration || 0) > 0) {
        const cost = indirectCosts.ownershipRegistration!;
        const ucs = ucsCostPerUnit > 0 ? cost / ucsCostPerUnit : 0;
        breakdown.push({ category: "Ownership Registration", ucs, cost });
      }
      if ((indirectCosts.certificateIssuance || 0) > 0) {
        const cost = indirectCosts.certificateIssuance!;
        const ucs = ucsCostPerUnit > 0 ? cost / ucsCostPerUnit : 0;
        breakdown.push({ category: "Certificate Issuance", ucs, cost });
      }
      if ((indirectCosts.websitePage || 0) > 0) {
        const cost = indirectCosts.websitePage!;
        const ucs = ucsCostPerUnit > 0 ? cost / ucsCostPerUnit : 0;
        breakdown.push({ category: "Website Page", ucs, cost });
      }
    }

    const totalUCS = breakdown.reduce((acc, item) => acc + item.ucs, 0);
    const totalCost = breakdown.reduce((acc, item) => acc + item.cost, 0);
    const totalParticipants = totalStaffParticipants + visitorParticipants;
    
    const totalDurationDays = Object.values(participants).reduce((max, p) => Math.max(max, p?.days || 0), 0);
    const totalEventHours = totalDurationDays * 24;

    const results: CalculationResult = {
      totalUCS,
      totalCost,
      ucsPerParticipant: totalParticipants > 0 ? totalUCS / totalParticipants : 0,
      costPerParticipant: totalParticipants > 0 ? totalCost / totalParticipants : 0,
      breakdown,
      equivalences: {
        dailyUCS: totalDurationDays > 0 ? totalUCS / totalDurationDays : 0,
        hourlyUCS: totalEventHours > 0 ? totalUCS / totalEventHours : 0,
        gdpPercentage: equivalences.gdpPerCapita > 0 ? (totalCost / equivalences.gdpPerCapita) * 100 : 0,
      },
    };

    onCalculate(results, values);
  }

  const handleResetClick = () => {
    form.reset({
      eventName: "",
      participants: {
        organizers: { count: 10, days: 20 },
        assemblers: { count: 100, days: 20 },
        suppliers: { count: 100, days: 20 },
        exhibitors: { count: 150, days: 20 },
        supportTeam: { count: 1000, days: 20 },
        attendants: { count: 200, days: 20 },
        support: { count: 300, days: 20 },
      },
      visitors: {
        count: 4500,
        hours: 3
      },
      indirectCosts: {
        ownershipRegistration: settings.indirectCosts.ownershipRegistration,
        certificateIssuance: settings.indirectCosts.certificateIssuance,
        websitePage: settings.indirectCosts.websitePage,
      }
    });
    onReset();
  }
  
  const ParticipantField = ({ name, icon, label }: { name: keyof FormData['participants'], icon: React.ReactNode, label: string }) => (
    <div className="space-y-2">
      <FormLabel className="flex items-center gap-2 text-sm">{icon} {label}</FormLabel>
      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name={`participants.${name}.count`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="number" placeholder={t('participants.quantity')} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                <Input type="number" placeholder={t('participants.days')} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
            <p className="font-medium">{t('participants.staffTitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <ParticipantField name="organizers" icon={<UserCog />} label={t('participants.organizersAndPromoters')} />
                <ParticipantField name="assemblers" icon={<Wrench />} label={t('participants.assemblers')} />
                <ParticipantField name="suppliers" icon={<Briefcase />} label={t('participants.suppliers')} />
                <ParticipantField name="exhibitors" icon={<Building2 />} label={t('participants.exhibitors')} />
                <ParticipantField name="supportTeam" icon={<Headset />} label={t('participants.supportTeam')} />
                <ParticipantField name="attendants" icon={<User />} label={t('participants.attendants')} />
                <ParticipantField name="support" icon={<Handshake />} label={t('participants.support')} />
            </div>
            
            <Separator />
            <p className="font-medium">{t('participants.visitorsTitle')}</p>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visitors.count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Users />{t('participants.quantity')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visitors.hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Clock />{t('participants.hours')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
