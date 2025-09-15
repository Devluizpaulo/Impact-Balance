"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalculationResult } from '@/lib/types';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart";

interface ImpactChartsProps {
    results: CalculationResult;
}

export default function ImpactCharts({ results }: ImpactChartsProps) {
    const chartData = results.breakdown.filter(item => item.ucs > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Impact Breakdown</CardTitle>
                <CardDescription>Contribution of each category to the total UCS.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    ucs: {
                        label: 'UCS',
                        color: 'hsl(var(--primary))',
                    },
                }} className="h-80 w-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
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
