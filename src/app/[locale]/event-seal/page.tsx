
"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/lib/event-storage";
import type { EventRecord } from "@/lib/types";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventCertificate from "@/components/event-certificate";


export default function EventSealPage() {
    const t = useTranslations("EventSealPage");
    const t_report = useTranslations("ExecutiveReport");
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const storedEvents = await getEvents();
            setEvents(storedEvents);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const handleViewReport = (event: EventRecord) => {
        setSelectedEvent(event);
        setIsReportOpen(true);
    }
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    return (
        <AppShell>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>

                <Card>
                    <CardHeader>
                         <CardTitle>{t('table.title')}</CardTitle>
                         <CardDescription>{t('table.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <p>{t('noEvents')}</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('table.eventName')}</TableHead>
                                        <TableHead>{t('table.date')}</TableHead>
                                        <TableHead className="text-right">{t('table.totalUCS')}</TableHead>
                                        <TableHead className="text-right">{t('table.totalCost')}</TableHead>
                                        <TableHead className="text-center">{t('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium flex items-center">
                                                <Award className="h-4 w-4 mr-2 text-primary/70" />
                                                {event.formData.eventName}
                                            </TableCell>
                                            <TableCell>{new Date(event.timestamp).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right font-mono">{event.results.totalUCS}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(event.results.totalCost)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewReport(event)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
             {selectedEvent && (
                <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                    <DialogContent className="max-w-5xl w-full h-[95vh] bg-gray-200 p-4 sm:p-8 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="sr-only">{t_report('title')}</DialogTitle>
                        </DialogHeader>
                        <div className="w-full h-full overflow-y-auto">
                           <EventCertificate event={selectedEvent} />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AppShell>
    );
}
