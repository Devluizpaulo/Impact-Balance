

"use client";

import { useEffect, useState, startTransition, useMemo } from "react";
import { getEvents, deleteEvent, archiveEvent, updateEvent, getClients } from "@/lib/event-storage";
import type { EventRecord, FormData, RenewalStatus, ClientData } from "@/lib/types";
import { renewalStatusSchema } from "@/lib/types";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileSearch, Loader2, Award, Archive, Trash2, ShieldCheck, RefreshCcw, FilterX, MessageSquare, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";


type SealStatus = 'valid' | 'expiring' | 'expired';

interface Seal extends EventRecord {
    expiryDate: Date;
    status: SealStatus;
    clientName?: string;
    parcProg?: string;
    uf?: string;
    taxa?: number;
    total?: number;
    telefone?: string;
}

const getStatus = (expiryDate: Date): SealStatus => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (expiryDate < now) {
        return 'expired';
    }
    if (expiryDate <= thirtyDaysFromNow) {
        return 'expiring';
    }
    return 'valid';
};

const statusVariant: Record<SealStatus, "default" | "destructive" | "secondary"> = {
    valid: 'default',
    expiring: 'secondary',
    expired: 'destructive'
};

const renewalStatusVariant: Record<RenewalStatus, "default" | "destructive" | "secondary" | "outline"> = {
    pending: 'outline',
    contacted: 'secondary',
    renewed: 'default',
    archived: 'destructive',
};

function EventsTable() {
    const t = useTranslations("EventSealPage");
    const t_report = useTranslations("ExecutiveReport");
    const { isAdmin } = useAuth();
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<EventRecord | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    const { toast } = useToast();

    const fetchEvents = async () => {
        setLoading(true);
        const storedEvents = await getEvents();
        // Filter for events that are NOT from legacy import (i.e. have full formdata and results)
        const calculatedEvents = storedEvents.filter(e => e.archived !== true && e.results.totalParticipants > 0);
        setEvents(calculatedEvents);
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
    
    const handleArchive = async (eventId: string) => {
      try {
        await archiveEvent(eventId);
        toast({ title: t('archiveSuccess') });
        fetchEvents();
      } catch (error) {
        toast({ variant: 'destructive', title: t('archiveError') });
        console.error("Failed to archive event:", error);
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
            fetchEvents();
            setIsDeleteDialogOpen(false);
            setEventToDelete(null);
        } catch (error) {
            toast({ variant: 'destructive', title: t('deleteError') });
            console.error("Failed to delete event:", error);
        }
    };

    const handleSelectEvent = (eventId: string, checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedEvents((prev) => [...prev, eventId]);
        } else {
            setSelectedEvents((prev) => prev.filter((id) => id !== eventId));
        }
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedEvents(events.map((e) => e.id));
        } else {
            setSelectedEvents([]);
        }
    };

    const handleBulkArchive = async () => {
        try {
            await Promise.all(selectedEvents.map(id => archiveEvent(id)));
            toast({ title: t('bulkArchiveSuccess', {count: selectedEvents.length})});
            fetchEvents();
            setSelectedEvents([]);
        } catch (error) {
            toast({ variant: 'destructive', title: t('archiveError') });
            console.error("Failed to bulk archive events:", error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedEvents.length === 0) return;
        try {
            await Promise.all(selectedEvents.map(id => deleteEvent(id)));
            toast({ title: t('bulkDeleteSuccess', {count: selectedEvents.length})});
            fetchEvents();
            setSelectedEvents([]);
        } catch (error) {
            toast({ variant: 'destructive', title: t('deleteError') });
            console.error("Failed to bulk delete events:", error);
        } finally {
            setIsBulkDeleteDialogOpen(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    
    const isAllSelected = events.length > 0 && selectedEvents.length === events.length;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{t('table.title')}</CardTitle>
                        <CardDescription>{t('table.description')}</CardDescription>
                    </div>
                    {selectedEvents.length > 0 && isAdmin && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleBulkArchive}>
                                <Archive className="mr-2 h-4 w-4" />
                                {t('bulkArchiveButton', { count: selectedEvents.length })}
                            </Button>
                            <Button variant="destructive" onClick={() => setIsBulkDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('bulkDeleteButton', { count: selectedEvents.length })}
                            </Button>
                        </div>
                    )}
                </div>
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
                                {isAdmin && (
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                )}
                                <TableHead className="w-[40%]">{t('table.eventName')}</TableHead>
                                <TableHead>{t('table.date')}</TableHead>
                                <TableHead className="text-right">{t('table.totalUCS')}</TableHead>
                                <TableHead className="text-right">{t('table.totalCost')}</TableHead>
                                <TableHead className="text-center">{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id} data-state={selectedEvents.includes(event.id) && "selected"}>
                                    {isAdmin && (
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedEvents.includes(event.id)}
                                                onCheckedChange={(checked) => handleSelectEvent(event.id, checked)}
                                                aria-label={`Select event ${event.formData.eventName}`}
                                            />
                                        </TableCell>
                                    )}
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
                                                    <Button variant="ghost" size="icon" onClick={() => handleArchive(event.id)}>
                                                        <Archive className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('tooltips.archive')}</p>
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

        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{t('bulkDeleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('bulkDeleteDialog.description', { count: selectedEvents.length })}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsBulkDeleteDialogOpen(false)}>{t('deleteDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('deleteDialog.confirm')}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </Card>
    );
}

function SealsTable() {
    const t = useTranslations("EventSealPage");
    const t_seals = useTranslations("EventSealPage.sealsTable");
    const t_renewal_status = useTranslations("EventSealPage.renewalStatus");
    const { isAdmin } = useAuth();
    const [seals, setSeals] = useState<Seal[]>([]);
    const [clients, setClients] = useState<(ClientData & {id: string})[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeals, setSelectedSeals] = useState<string[]>([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sealToDelete, setSealToDelete] = useState<Seal | null>(null);
    const { toast } = useToast();
    const [filterYear, setFilterYear] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState<string>('all');
    const [sealToRenew, setSealToRenew] = useState<Seal | null>(null);
    const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
    
    // State for the editable fields in the renewal modal
    const [renewalContactName, setRenewalContactName] = useState('');
    const [renewalPhone, setRenewalPhone] = useState('');
    const [renewalNotes, setRenewalNotes] = useState('');
    const [renewalStatus, setRenewalStatus] = useState<RenewalStatus>('pending');


    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    const formatDate = (timestamp: number | Date) => {
        return new Date(timestamp).toLocaleString('pt-BR');
    }

    const fetchSealsAndClients = async () => {
        setLoading(true);
        const [storedEvents, storedClients] = await Promise.all([getEvents(), getClients()]);
        setClients(storedClients);

        const legacySeals = storedEvents
            .filter(e => e.archived !== true && e.results.totalParticipants === 0) // Filter for legacy seals
            .map(event => {
                const issueDate = new Date(event.timestamp);
                const expiryDate = new Date(new Date(issueDate).setFullYear(issueDate.getFullYear() + 1));
                const formData = event.formData as FormData;
                return {
                    ...event,
                    expiryDate,
                    status: getStatus(expiryDate),
                    clientName: formData.clientName || 'N/A',
                    parcProg: formData.parcProg || 'N/A',
                    uf: formData.uf || 'N/A',
                    taxa: formData.taxa || 0,
                    total: event.results.totalCost,
                    telefone: formData.telefone,
                };
            });
        setSeals(legacySeals);
        setLoading(false);
    };

    useEffect(() => {
        startTransition(() => {
            fetchSealsAndClients();
        });
    }, []);

    const handleSelectSeal = (sealId: string, checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedSeals((prev) => [...prev, sealId]);
        } else {
            setSelectedSeals((prev) => prev.filter((id) => id !== sealId));
        }
    };

    const handleSelectAllSeals = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedSeals(filteredSeals.map((s) => s.id));
        } else {
            setSelectedSeals([]);
        }
    };

    const handleBulkArchive = async () => {
        try {
            await Promise.all(selectedSeals.map(id => archiveEvent(id)));
            toast({ title: t('bulkArchiveSuccess', {count: selectedSeals.length})});
            fetchSealsAndClients();
            setSelectedSeals([]);
        } catch (error) {
            toast({ variant: 'destructive', title: t('archiveError') });
            console.error("Failed to bulk archive seals:", error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedSeals.length === 0) return;
        try {
            await Promise.all(selectedSeals.map(id => deleteEvent(id)));
            toast({ title: t('bulkDeleteSuccess', {count: selectedSeals.length})});
            fetchSealsAndClients();
            setSelectedSeals([]);
        } catch (error) {
            toast({ variant: 'destructive', title: t('deleteError') });
            console.error("Failed to bulk delete seals:", error);
        } finally {
            setIsBulkDeleteDialogOpen(false);
        }
    };

    const openDeleteDialog = (seal: Seal) => {
        setSealToDelete(seal);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!sealToDelete) return;
        try {
            await deleteEvent(sealToDelete.id);
            toast({ title: t('deleteSuccess') });
            fetchSealsAndClients();
            setIsDeleteDialogOpen(false);
            setSealToDelete(null);
        } catch (error) {
            toast({ variant: 'destructive', title: t('deleteError') });
            console.error("Failed to delete seal:", error);
        }
    };

    const handleArchive = async (sealId: string) => {
        try {
          await archiveEvent(sealId);
          toast({ title: t('archiveSuccess') });
          fetchSealsAndClients();
        } catch (error) {
          toast({ variant: 'destructive', title: t('archiveError') });
          console.error("Failed to archive seal:", error);
        }
    };

    const openRenewalModal = (seal: Seal) => {
        setSealToRenew(seal);

        // Try to find a matching client from the Agenda
        const sealClientName = (seal.clientName || '').trim().toLowerCase();
        const matchingClient = clients.find(c => 
            (c.nomeFantasia || '').trim().toLowerCase() === sealClientName ||
            (c.razaoSocial || '').trim().toLowerCase() === sealClientName ||
            (c.name || '').trim().toLowerCase() === sealClientName
        );
        
        // Pre-fill from existing seal data first, then try Agenda as a fallback.
        let contactName = seal.formData.contactName || '';
        let phone = seal.formData.telefone || '';

        // If a matching client is found, use their data only if the seal-specific data is empty.
        if (matchingClient) {
            const clientDisplayName = matchingClient.accountType === 'pj' ? (matchingClient.razaoSocial || matchingClient.nomeFantasia) : matchingClient.name;
            contactName = contactName || clientDisplayName || '';
            phone = phone || matchingClient.mobile || matchingClient.phone || '';
        }
        
        setRenewalContactName(contactName);
        setRenewalPhone(phone);
        setRenewalNotes(seal.formData.renewalNotes || '');
        setRenewalStatus(seal.formData.renewalStatus || 'pending');
        setIsRenewalModalOpen(true);
    };
    
    const handleContactViaWhatsApp = (seal: Seal | null) => {
        if (!seal) return;
        const phoneToUse = renewalPhone || seal.telefone;
        if (!phoneToUse) {
            toast({ variant: 'destructive', title: t_seals('renewalErrorTitle'), description: t_seals('renewalErrorNoPhone') });
            return;
        }
        const message = encodeURIComponent(t_seals('renewalMessage', {
            client: seal.clientName || 'Cliente',
            pedido: seal.formData.eventName,
            expiryDate: seal.expiryDate.toLocaleDateString('pt-BR')
        }));
        const phoneNumber = phoneToUse.replace(/\D/g, '');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };
    
    const handleSaveRenewal = async () => {
        if (!sealToRenew) return;
        try {
            const dataToUpdate: Partial<FormData> = {
                contactName: renewalContactName,
                telefone: renewalPhone,
                renewalNotes: renewalNotes,
                renewalStatus: renewalStatus,
            };
            await updateEvent(sealToRenew.id, dataToUpdate);
            
            if (renewalStatus === 'archived') {
                await archiveEvent(sealToRenew.id);
            }

            toast({ title: t_seals('renewalSaveSuccess') });
            fetchSealsAndClients(); // Refresh the list
            setIsRenewalModalOpen(false); // Close modal on success
        } catch (error) {
            console.error("Failed to save renewal data:", error);
            toast({ variant: 'destructive', title: t_seals('renewalSaveError') });
        }
    };

    const { filteredSeals, availableYears, availableMonths } = useMemo(() => {
        const years = new Set<string>();
        const months = new Set<string>();

        seals.forEach(seal => {
            const date = new Date(seal.timestamp);
            years.add(date.getFullYear().toString());
            months.add((date.getMonth() + 1).toString().padStart(2, '0'));
        });
        
        const filtered = seals.filter(seal => {
            const date = new Date(seal.timestamp);
            const yearMatch = filterYear === 'all' || date.getFullYear().toString() === filterYear;
            const monthMatch = filterMonth === 'all' || (date.getMonth() + 1).toString().padStart(2, '0') === filterMonth;
            return yearMatch && monthMatch;
        });

        return {
            filteredSeals: filtered,
            availableYears: Array.from(years).sort((a, b) => b.localeCompare(a)),
            availableMonths: Array.from(months).sort((a, b) => a.localeCompare(b)),
        };
    }, [seals, filterYear, filterMonth]);
    
    const resetFilters = () => {
        setFilterYear('all');
        setFilterMonth('all');
    };


    const isAllSelected = filteredSeals.length > 0 && selectedSeals.length === filteredSeals.length;

    const getDisplayStatus = (seal: Seal) => {
        const renewalStatus = seal.formData.renewalStatus;
        // If renewal status is set and not 'pending', show renewal status.
        if (renewalStatus && renewalStatus !== 'pending') {
            return {
                label: t_renewal_status(renewalStatus),
                variant: renewalStatusVariant[renewalStatus],
            };
        }
        // Otherwise, show validity status.
        return {
            label: t(`status.${seal.status}`),
            variant: statusVariant[seal.status],
        };
    };

    return (
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{t_seals('title')}</CardTitle>
                        <CardDescription>{t_seals('description')}</CardDescription>
                    </div>
                     <div className="flex gap-2 items-center">
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder={t_seals('filterYear')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t_seals('allYears')}</SelectItem>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterMonth} onValueChange={setFilterMonth}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder={t_seals('filterMonth')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t_seals('allMonths')}</SelectItem>
                                {availableMonths.map(month => (
                                    <SelectItem key={month} value={month}>{
                                        new Date(2000, parseInt(month)-1, 1).toLocaleString('default', { month: 'long' })
                                    }</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Button variant="ghost" size="icon" onClick={resetFilters} disabled={filterYear === 'all' && filterMonth === 'all'}>
                            <FilterX className="h-4 w-4" />
                         </Button>
                    </div>
                </div>
                 {selectedSeals.length > 0 && isAdmin && (
                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={handleBulkArchive}>
                            <Archive className="mr-2 h-4 w-4" />
                            {t('bulkArchiveButton', { count: selectedSeals.length })}
                        </Button>
                        <Button variant="destructive" onClick={() => setIsBulkDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('bulkDeleteButton', { count: selectedSeals.length })}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredSeals.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                        <ShieldCheck className="w-16 h-16 text-muted-foreground/30" />
                        <p>{t_seals('noSeals')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isAdmin && (
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAllSeals}
                                            aria-label="Select all seals"
                                        />
                                    </TableHead>
                                )}
                                <TableHead>{t_seals('pedido')}</TableHead>
                                <TableHead>{t_seals('data')}</TableHead>
                                <TableHead>{t_seals('cliente')}</TableHead>
                                <TableHead>{t_seals('telefone')}</TableHead>
                                <TableHead>{t_seals('parcProg')}</TableHead>
                                <TableHead>{t_seals('uf')}</TableHead>
                                <TableHead className="text-right">{t_seals('quantidade')}</TableHead>
                                <TableHead className="text-right">{t_seals('taxa')}</TableHead>
                                <TableHead className="text-right">{t_seals('total')}</TableHead>
                                <TableHead className="text-center">{t_seals('status')}</TableHead>
                                 {isAdmin && <TableHead className="text-center">{t('table.actions')}</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSeals.map((seal) => {
                                const displayStatus = getDisplayStatus(seal);
                                return (
                                <TableRow key={seal.id} data-state={selectedSeals.includes(seal.id) && "selected"}>
                                    {isAdmin && (
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedSeals.includes(seal.id)}
                                                onCheckedChange={(checked) => handleSelectSeal(seal.id, checked)}
                                                aria-label={`Select seal ${seal.formData.eventName}`}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="font-medium">{seal.formData.eventName}</TableCell>
                                    <TableCell>{formatDate(seal.timestamp)}</TableCell>
                                    <TableCell>{seal.clientName}</TableCell>
                                    <TableCell>{seal.telefone}</TableCell>
                                    <TableCell>{seal.parcProg}</TableCell>
                                    <TableCell>{seal.uf}</TableCell>
                                    <TableCell className="text-right font-mono">{seal.results.totalUCS} UCS</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(seal.taxa || 0)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(seal.total || 0)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={displayStatus.variant as "default" | "destructive" | "secondary" | "outline"}>
                                            {displayStatus.label}
                                        </Badge>
                                    </TableCell>
                                     {isAdmin && (
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => openRenewalModal(seal)}>
                                                            <RefreshCcw className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t_seals('renew')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleArchive(seal.id)}>
                                                            <Archive className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('tooltips.archive')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(seal)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('tooltips.delete')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                     )}
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    </div>
                )}
            </CardContent>
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteDialog.description', { eventName: sealToDelete?.formData.eventName })}
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

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('bulkDeleteDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('bulkDeleteDialog.description', { count: selectedSeals.length })}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsBulkDeleteDialogOpen(false)}>{t('deleteDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('deleteDialog.confirm')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Renewal Process Dialog */}
             {sealToRenew && (
                <Dialog open={isRenewalModalOpen} onOpenChange={setIsRenewalModalOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{t_seals('renewalModal.title')}</DialogTitle>
                            <DialogDescription>{t_seals('renewalModal.description', { client: sealToRenew.clientName, order: sealToRenew.formData.eventName })}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="contact-name">{t_seals('renewalModal.contactName')}</Label>
                                    <Input id="contact-name" value={renewalContactName} onChange={(e) => setRenewalContactName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-phone">{t_seals('telefone')}</Label>
                                    <Input id="contact-phone" value={renewalPhone} onChange={(e) => setRenewalPhone(e.target.value)} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="renewal-status">{t_seals('renewalModal.status')}</Label>
                                <Select value={renewalStatus} onValueChange={(value) => setRenewalStatus(value as RenewalStatus)}>
                                    <SelectTrigger id="renewal-status">
                                        <SelectValue placeholder={t_seals('renewalModal.statusPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {renewalStatusSchema.options.map(status => (
                                            <SelectItem key={status} value={status}>{t_renewal_status(status)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="renewal-notes">{t_seals('renewalModal.notes')}</Label>
                                <Textarea id="renewal-notes" value={renewalNotes} onChange={(e) => setRenewalNotes(e.target.value)} placeholder={t_seals('renewalModal.notesPlaceholder')} />
                            </div>
                            <Separator />
                            <div className="text-sm space-y-2">
                                <p><span className="font-semibold">{t_seals('pedido')}:</span> {sealToRenew.formData.eventName}</p>
                                <div className="flex items-center gap-3">
                                    <Badge variant={statusVariant[sealToRenew.status]} className="text-xs">
                                      {t(`status.${sealToRenew.status}`)}
                                    </Badge>
                                    <div className="text-sm">
                                        {t_seals('renewalModal.expiry')}: {sealToRenew.expiryDate.toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between w-full">
                            <Button variant="ghost" className="text-destructive hover:text-destructive justify-start px-0 sm:px-4" onClick={() => { handleArchive(sealToRenew.id); setIsRenewalModalOpen(false); }}>
                                <Archive className="mr-2 h-4 w-4" />
                                {t('tooltips.archive')}
                            </Button>
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                                <Button type="button" variant="secondary" onClick={() => setIsRenewalModalOpen(false)}>
                                    {t('deleteDialog.cancel')}
                                </Button>
                                 <Button onClick={handleSaveRenewal}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t_seals('renewalModal.save')}
                                </Button>
                                <Button variant="outline" onClick={() => handleContactViaWhatsApp(sealToRenew)} disabled={!renewalPhone && !sealToRenew.telefone}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    {t_seals('renewalModal.contact')}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
             )}
        </Card>
    )
}

export default function EventSealPage() {
    const t = useTranslations("EventSealPage");
    return (
        <AppShell>
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>
            
            <Tabs defaultValue="events">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="events">{t('tabs.events')}</TabsTrigger>
                    <TabsTrigger value="seals">{t('tabs.seals')}</TabsTrigger>
                </TabsList>
                <TabsContent value="events" className="mt-4">
                    <EventsTable />
                </TabsContent>
                <TabsContent value="seals" className="mt-4">
                    <SealsTable />
                </TabsContent>
            </Tabs>
        </AppShell>
    );
}

    

    