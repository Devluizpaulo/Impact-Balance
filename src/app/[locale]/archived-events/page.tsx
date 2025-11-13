
"use client";

import { useEffect, useState, startTransition } from "react";
import { getEvents, deleteEvent, unarchiveEvent } from "@/lib/event-storage";
import type { EventRecord } from "@/lib/types";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSearch, Loader2, Award, ArchiveRestore, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventCertificate from "@/components/event-certificate";
import CertificateActions from "@/components/certificate-actions";
import ExecutiveReport from "@/components/executive-report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ArchivedEventsPage() {
    const t = useTranslations("ArchivedEventsPage");
    const t_report = useTranslations("ExecutiveReport");
    const { isAdmin } = useAuth();
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<EventRecord | null>(null);
    const { toast } = useToast();

    const fetchEvents = async () => {
        setLoading(true);
        const storedEvents = await getEvents();
        setEvents(storedEvents.filter(e => e.archived === true));
        setLoading(false);
    };

    useEffect(() => {
        startTransition(() => {
            fetchEvents();
        });
    }, []);

    const handleViewReport = (event: EventRecord) => {
        setSelectedEvent(event);
        setIsReportOpen(true);
    }
    
    const handleUnarchive = async (eventId: string) => {
      try {
        await unarchiveEvent(eventId);
        toast({ title: t('unarchiveSuccess') });
        fetchEvents(); // Refresh list
      } catch (error) {
        toast({ variant: 'destructive', title: t('unarchiveError') });
        console.error("Failed to unarchive event:", error);
      }
    };
    
    const openDeleteDialog = (event: EventRecord) => {
        setEventToDelete(event);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!eventToDelete) return;
        try {
            await deleteEvent(eventToDelete.id);
            toast({ title: t('deleteSuccess') });
            fetchEvents(); // Refresh list
            setIsDeleteDialogOpen(false);
            setEventToDelete(null);
        } catch (error) {
            toast({ variant: 'destructive', title: t('deleteError') });
            console.error("Failed to delete event:", error);
        }
    };


    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    return (
        <AppShell>
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
                        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                            <FileSearch className="w-16 h-16 text-muted-foreground/30" />
                            <p>{t('noEvents')}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">{t('table.eventName')}</TableHead>
                                    <TableHead>{t('table.date')}</TableHead>
                                    <TableHead className="text-right">{t('table.totalUCS')}</TableHead>
                                    <TableHead className="text-right">{t('table.totalCost')}</TableHead>
                                    <TableHead className="text-center">{t('table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <Award className="h-4 w-4 mr-2 text-primary/70" />
                                                <span>{event.formData.eventName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(event.timestamp).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right font-mono">{event.results.totalUCS}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(event.results.totalCost)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewReport(event)}>
                                                        <FileSearch className="h-4 w-4" />
                                                    </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                    <p>{t('tooltips.view')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                {isAdmin && (
                                                <>
                                                    <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleUnarchive(event.id)}>
                                                            <ArchiveRestore className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('tooltips.unarchive')}</p>
                                                    </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(event)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('tooltips.delete')}</p>
                                                    </TooltipContent>
                                                    </Tooltip>
                                                </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            {selectedEvent && (
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-5xl w-full h-[95vh] p-4 sm:p-6 flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="sr-only">{t_report('title')}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="report" className="flex-grow flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="report">{t('tabs.report')}</TabsTrigger>
                            <TabsTrigger value="certificate">{t('tabs.certificate')}</TabsTrigger>
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
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('deleteDialog.description', { eventName: eventToDelete?.formData.eventName })}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>{t('deleteDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('deleteDialog.confirm')}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </AppShell>
    );
}
