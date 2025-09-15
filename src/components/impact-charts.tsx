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
    const chartData = results.breakdown.filter(item => item.ucs > 0);

    const categoryTranslations: {[key: string]: string} = {
        "Participants": t('categories.participants'),
        "Duration": t('categories.duration'),
        "Venue Size": t('categories.venueSize'),
        "Travel": t('categories.travel'),
        "Waste": t('categories.waste'),
        "Water": t('categories.water'),
        "Energy": t('categories.energy'),
        "Ownership Registration": t('categories.ownershipRegistration'),
        "Certificate Issuance": t('categories.certificateIssuance'),
        "Website Page": t('categories.websitePage'),
    }

    const translatedData = chartData.map(item => ({
        ...item,
        category: categoryTranslations[item.category] || item.category
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    ucs: {
                        label: 'UCS',
                        color: 'hsl(var(--primary))',
                    },
                }} className="h-80 w-full">
                    <BarChart accessibilityLayer data={translatedData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                        <ChartTooltip
                          cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="ucs" fill="var(--color-ucs)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
