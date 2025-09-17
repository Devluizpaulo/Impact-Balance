
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalculationResult } from '@/lib/types';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { useTranslations } from 'next-intl';

interface ImpactChartsProps {
    results: CalculationResult;
}

export default function ImpactCharts({ results }: ImpactChartsProps) {
    const t = useTranslations('ImpactCharts');

    const categoryTranslations: Record<string, string> = {
        organizers: t('categories.organizers'),
        assemblers: t('categories.assemblers'),
        suppliers: t('categories.suppliers'),
        exhibitors: t('categories.exhibitors'),
        supportTeam: t('categories.supportTeam'),
        attendants: t('categories.attendants'),
        support: t('categories.support'),
        visitors: t('categories.visitors'),
        ownershipRegistration: t('categories.ownershipRegistration'),
        certificateIssuance: t('categories.certificateIssuance'),
        websitePage: t('categories.websitePage'),
    };
    
    // Chart data should only include items that contribute to UCS
    const chartData = results.breakdown.filter(item => item.ucs > 0);


    const translatedData = chartData.map(item => ({
        ...item,
        category: categoryTranslations[item.category] || item.category
    }));

    return (
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200 text-gray-800">
            <CardHeader>
                <CardTitle className="font-headline text-gray-900">{t('title')}</CardTitle>
                <CardDescription className="text-gray-600">{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    ucs: {
                        label: 'UCS',
                        color: 'hsl(var(--primary))',
                    },
                }} className="h-80 w-full">
                    <BarChart accessibilityLayer data={translatedData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: 'hsl(var(--muted-foreground))' }}/>
                        <ChartTooltip
                          cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                          content={<ChartTooltipContent indicator="dot" className="bg-white/80 backdrop-blur-sm border-gray-200" />}
                        />
                        <Bar dataKey="ucs" fill="var(--color-ucs)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
