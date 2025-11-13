
"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "@/navigation";
import { useEffect, useState, startTransition } from "react";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/event-storage";
import type { EventRecord } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Calendar, Hash, DollarSign, ArrowRight, LineChart, FileSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExecutiveReport from "@/components/executive-report";
import CertificateActions from "@/components/certificate-actions";
import EventCertificate from "@/components/event-certificate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const AdminDashboardContent = () => {
    const t = useTranslations("Dashboard");
    const t_report_tabs = useTranslations("EventSealPage.tabs");
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);


    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const storedEvents = await getEvents();
            // Filter to show only non-archived events on the dashboard
            setEvents(storedEvents.filter(e => e.archived !== true));
            setLoading(false);
        };
        startTransition(() => {
            fetchEvents();
        });
    }, []);

    const handleViewReport = (event: EventRecord) => {
        setSelectedEvent(event);
        setIsReportOpen(true);
    }

    const totalEvents = events.length;
    const totalUcs = events.reduce((sum, event) => sum + event.results.totalUCS, 0);
    const totalCost = events.reduce((sum, event) => sum + event.results.totalCost, 0);
    const averageUcsPerEvent = totalEvents > 0 ? totalUcs / totalEvents : 0;
    const recentEvents = events.slice(0, 5);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
    }

    const monthlyData = events.reduce((acc, event) => {
        const month = new Date(event.timestamp).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
            acc[month] = 0;
        }
        acc[month] += event.results.totalUCS;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(monthlyData).map(([name, ucs]) => ({ name, ucs: Math.ceil(ucs) })).reverse();


    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('kpi.totalEvents')}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totalEvents)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('kpi.totalUcs')}</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totalUcs)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('kpi.totalCost')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('kpi.avgUcs')}</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(averageUcsPerEvent)}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{t('recentEvents.title')}</CardTitle>
                                <CardDescription>{t('recentEvents.description')}</CardDescription>
                            </div>
                             <Button variant="outline" size="sm" asChild>
                                <Link href="/event-seal">{t('recentEvents.seeAll')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentEvents.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('recentEvents.eventName')}</TableHead>
                                    <TableHead className="text-right">{t('recentEvents.ucs')}</TableHead>
                                    <TableHead className="hidden sm:table-cell">{t('recentEvents.date')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentEvents.map(event => (
                                    <TableRow key={event.id} onClick={() => handleViewReport(event)} className="cursor-pointer">
                                        <TableCell>
                                            <div className="font-medium">{event.formData.eventName}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatNumber(event.results.totalUCS)}</TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{new Date(event.timestamp).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        ) : (
                             <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                                <FileSearch className="w-12 h-12 text-muted-foreground/30" />
                                <p className="text-sm">{t('recentEvents.noEvents')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{t('monthlyChart.title')}</CardTitle>
                        <CardDescription>{t('monthlyChart.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                  }}
                                />
                                <Bar dataKey="ucs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {selectedEvent && (
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-5xl w-full h-[95vh] p-4 sm:p-6 flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="sr-only">{t_report_tabs('report')}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="report" className="flex-grow flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="report">{t_report_tabs('report')}</TabsTrigger>
                            <TabsTrigger value="certificate">{t_report_tabs('certificate')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="report" className="flex-grow overflow-y-auto mt-4 pr-2">
                            <ExecutiveReport results={selectedEvent.results} formData={selectedEvent.formData} />
                        </TabsContent>
                        <TabsContent value="certificate" className="flex-grow overflow-y-auto mt-4">
                            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                                <CertificateActions event={selectedEvent} />
                                <EventCertificate event={selectedEvent} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        )}
        </div>
    )
}

export default function DashboardPage() {
    const { isAdmin, promptLogin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin) {
            promptLogin();
            router.push('/');
        }
    }, [isAdmin, router, promptLogin]);
    
    if (!isAdmin) {
        return null; // Or a loading spinner
    }
    
    return (
        <AppShell>
            <AdminDashboardContent />
        </AppShell>
    );
}

    