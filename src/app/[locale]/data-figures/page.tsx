
"use client";

import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { worldFootprintData, type WorldFootprintDataPoint } from "@/lib/data/world-footprint-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart";

export default function DataFiguresPage() {
  const t = useTranslations("DataFiguresPage");

  const formatGha = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }

  const formatGhaTotal = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  }
  
  const chartData = worldFootprintData.map(d => ({
    year: d.year.toString(),
    [t('chart.footprint')]: d.ecological_footprint_consumption_per_capita,
    [t('chart.biocapacity')]: d.biocapacity_per_capita
  }));


  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('chart.title')}</CardTitle>
                    <CardDescription>{t('chart.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={{
                        footprint: {
                            label: t('chart.footprint'),
                            color: 'hsl(var(--destructive))',
                        },
                        biocapacity: {
                            label: t('chart.biocapacity'),
                            color: 'hsl(var(--primary))',
                        },
                    }} className="h-96 w-full">
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                              dataKey="year" 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                            />
                            <YAxis 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              label={{ value: t('chart.yAxisLabel'), angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle' } }}
                            />
                            <Tooltip
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Area type="monotone" dataKey={t('chart.footprint')} stackId="1" stroke="var(--color-footprint)" fill="var(--color-footprint)" fillOpacity={0.6} />
                            <Area type="monotone" dataKey={t('chart.biocapacity')} stackId="2" stroke="var(--color-biocapacity)" fill="var(--color-biocapacity)" fillOpacity={0.6} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>{t('table.year')}</TableHead>
                                  <TableHead className="text-right">{t('table.footprint_prod_capita')}</TableHead>
                                  <TableHead className="text-right">{t('table.footprint_consum_capita')}</TableHead>
                                  <TableHead className="text-right">{t('table.biocapacity_capita')}</TableHead>
                                  <TableHead className="text-right">{t('table.footprint_prod_total')}</TableHead>
                                  <TableHead className="text-right">{t('table.footprint_consum_total')}</TableHead>
                                  <TableHead className="text-right">{t('table.biocapacity_total')}</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {worldFootprintData.map((data: WorldFootprintDataPoint) => (
                                  <TableRow key={data.year}>
                                      <TableCell className="font-medium">{data.year}{data.is_preliminary ? '*' : ''}</TableCell>
                                      <TableCell className="text-right">{formatGha(data.ecological_footprint_production_per_capita)}</TableCell>
                                      <TableCell className="text-right">{formatGha(data.ecological_footprint_consumption_per_capita)}</TableCell>
                                      <TableCell className="text-right">{formatGha(data.biocapacity_per_capita)}</TableCell>
                                      <TableCell className="text-right">{formatGhaTotal(data.ecological_footprint_production_total)}</TableCell>
                                      <TableCell className="text-right">{formatGhaTotal(data.ecological_footprint_consumption_total)}</TableCell>
                                      <TableCell className="text-right">{formatGhaTotal(data.biocapacity_total)}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">* {t('table.preliminary')}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}

    