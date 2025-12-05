
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { clientSchema, type ClientData, clientStatusSchema, clientProfileSchema, ClientProfile, type ClientStatus } from "@/lib/types";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building, User, Landmark, PlusCircle, Download, Users, UserCheck, UserX, Search, Trash2, CalendarIcon, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Check, FileUp, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addClient, getClients, updateClient, deleteClients } from "@/lib/event-storage";
import * as XLSX from 'xlsx';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";


// --- Sub-components for the new UI ---

const KpiCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <h3 className="text-xs font-medium uppercase tracking-wider">{title}</h3>
            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white", color)}>
                {icon}
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</div>
        </CardContent>
    </Card>
);

const ClientForm = ({ onSave, clientToEdit }: { onSave: () => void, clientToEdit?: ClientData | null }) => {
    const t = useTranslations("AgendaPage");
    const t_profiles = useTranslations("Profiles");
    const { toast } = useToast();

    const form = useForm<ClientData>({
        resolver: zodResolver(clientSchema),
        defaultValues: clientToEdit || {
            accountType: 'pj',
            documentType: 'CNPJ',
            country: 'Brasil',
            status: 'Ativo',
            profiles: [],
        },
    });

     useEffect(() => {
        if (clientToEdit) {
            form.reset(clientToEdit);
        } else {
             form.reset({
                accountType: 'pj',
                documentType: 'CNPJ',
                country: 'Brasil',
                status: 'Ativo',
                profiles: [],
             });
        }
    }, [clientToEdit, form]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (value.accountType === 'pj') {
                form.setValue('documentType', 'CNPJ');
            } else {
                form.setValue('documentType', 'CPF');
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);


    const onSubmit = async (data: ClientData) => {
        try {
            if (clientToEdit && clientToEdit.id) {
                await updateClient(clientToEdit.id, data);
            } else {
                await addClient(data);
            }
            toast({ title: t("form.saveSuccess") });
            form.reset();
            onSave();
        } catch (error) {
            console.error(t("form.saveError"), error);
            toast({ title: t("form.saveError"), variant: "destructive" });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto p-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coluna da Esquerda */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5" /> {t("form.accountTitle")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="accountType" render={({ field }) => (
                                    <FormItem><FormLabel>{t("form.accountType")}:</FormLabel><FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="pf" id="pf" /></FormControl><FormLabel htmlFor="pf" className="font-normal">{t("form.person")}</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="pj" id="pj" /></FormControl><FormLabel htmlFor="pj" className="font-normal">{t("form.company")}</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl><FormMessage /></FormItem>
                                )} />
                                
                                {form.getValues('accountType') === 'pj' && (
                                    <>
                                     <FormField control={form.control} name="razaoSocial" render={({ field }) => (<FormItem><FormLabel>{t("form.razaoSocial")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="nomeFantasia" render={({ field }) => (<FormItem><FormLabel>{t("form.nomeFantasia")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>{t("form.firstName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                  <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>{t("form.lastName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="documentType" render={({ field }) => (<FormItem><FormLabel>{t("form.documentType")} *</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="documentNumber" render={({ field }) => (<FormItem><FormLabel>{form.getValues('accountType') === 'pj' ? 'CNPJ' : 'CPF'} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t("form.phone")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel>{t("form.mobile")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.status")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={t("form.selectPlaceholder")} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {clientStatusSchema.options.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="profiles"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.profiles")}</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className={cn("w-full justify-between h-auto min-h-10", !(field.value && field.value.length > 0) && "text-muted-foreground")}>
                                                            <div className="flex flex-wrap gap-1">
                                                                {field.value && field.value.length > 0 ? field.value.map(profile => (
                                                                    <Badge variant="secondary" key={profile} className="rounded-sm font-normal">
                                                                        {t_profiles(profile)}
                                                                    </Badge>
                                                                )) : t("form.selectPlaceholder")}
                                                            </div>
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                     <Command>
                                                        <CommandInput placeholder={t("form.searchProfile")} />
                                                        <CommandList>
                                                            <CommandEmpty>{t("form.noProfileFound")}</CommandEmpty>
                                                            <CommandGroup>
                                                                <ScrollArea className="h-48">
                                                                    {clientProfileSchema.options.map((profile) => (
                                                                        <CommandItem
                                                                            key={profile}
                                                                            onSelect={() => {
                                                                                const currentValue = field.value || [];
                                                                                const newValue = currentValue.includes(profile)
                                                                                    ? currentValue.filter((p) => p !== profile)
                                                                                    : [...currentValue, profile];
                                                                                field.onChange(newValue);
                                                                            }}
                                                                        >
                                                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", field.value?.includes(profile) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible" )}>
                                                                                <Check className="h-4 w-4" />
                                                                            </div>
                                                                            {t_profiles(profile)}
                                                                        </CommandItem>
                                                                    ))}
                                                                </ScrollArea>
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Coluna da Direita */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building className="w-5 h-5" /> {t("form.addressTitle")}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>{t("form.country")}</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>{t("form.state")}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t("form.selectPlaceholder")} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Mato Grosso">Mato Grosso</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>{t("form.city")}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t("form.selectPlaceholder")} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Sinop">Sinop</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="street" render={({ field }) => (<FormItem><FormLabel>{t("form.street")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="complement" render={({ field }) => (<FormItem><FormLabel>{t("form.complement")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="neighborhood" render={({ field }) => (<FormItem><FormLabel>{t("form.neighborhood")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>{t("form.number")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Landmark className="w-5 h-5" /> {t("form.bankTitle")}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="bank" render={({ field }) => (<FormItem><FormLabel>{t("form.bank")}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t("form.selectPlaceholder")} /></SelectTrigger></FormControl><SelectContent><SelectItem value="banco1">Banco 1</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="accountTypeBank" render={({ field }) => (<FormItem><FormLabel>{t("form.bankAccountType")}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t("form.selectPlaceholder")} /></SelectTrigger></FormControl><SelectContent><SelectItem value="corrente">{t("form.checking")}</SelectItem><SelectItem value="poupanca">{t("form.savings")}</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="agency" render={({ field }) => (<FormItem><FormLabel>{t("form.agency")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="accountNumber" render={({ field }) => (<FormItem><FormLabel>{t("form.accountNumber")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="pt-6">
                    <Button type="button" variant="ghost" onClick={onSave}>{t("form.cancel")}</Button>
                    <Button type="submit">{clientToEdit ? t('form.update') : t('form.save')}</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '-'}</p>
    </div>
);

const ViewClientDialog = ({ client, isOpen, onOpenChange }: { client: ClientData | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const t = useTranslations("AgendaPage");
    const t_profiles = useTranslations("Profiles");

    if (!client) return null;

    const displayName = client.accountType === 'pj' ? (client.razaoSocial || client.nomeFantasia) : client.name;
    const documentLabel = client.accountType === 'pj' ? 'CNPJ' : 'CPF';
    
    // Ensure createdAt is a valid Date object before formatting
    let formattedDate = '-';
    if (client.createdAt) {
        const date = client.createdAt instanceof Date ? client.createdAt : new Date(client.createdAt as string | number);
        if (!isNaN(date.getTime())) {
            formattedDate = format(date, "dd/MM/yyyy HH:mm");
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('form.viewClientTitle', { name: displayName })}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4 max-h-[70vh] overflow-y-auto">
                    {/* Coluna da Esquerda */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><User className="w-5 h-5" />{t('form.accountTitle')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label={t('form.accountType')} value={client.accountType === 'pj' ? t('form.company') : t('form.person')} />
                            <DetailRow label={documentLabel} value={client.documentNumber} />
                        </div>
                        {client.accountType === 'pj' && (
                            <>
                                <DetailRow label={t('form.razaoSocial')} value={client.razaoSocial} />
                                <DetailRow label={t('form.nomeFantasia')} value={client.nomeFantasia} />
                            </>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                           <DetailRow label={t('form.firstName')} value={client.firstName} />
                           <DetailRow label={t('form.lastName')} value={client.lastName} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                           <DetailRow label={t('form.phone')} value={client.phone} />
                           <DetailRow label={t('form.mobile')} value={client.mobile} />
                        </div>
                        <DetailRow label="Email" value={client.email} />
                        <DetailRow label={t('form.status')} value={client.status} />
                         <DetailRow label={t('form.registerDate')} value={formattedDate} />
                    </div>
                     {/* Coluna da Direita */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Building className="w-5 h-5" /> {t('form.addressTitle')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label="CEP" value={client.postalCode} />
                            <DetailRow label={t('form.country')} value={client.country} />
                        </div>
                        <DetailRow label={t('form.street')} value={`${client.street || ''}, ${client.number || ''}`} />
                        <DetailRow label={t('form.complement')} value={client.complement} />
                         <div className="grid grid-cols-2 gap-4">
                            <DetailRow label={t('form.neighborhood')} value={client.neighborhood} />
                            <DetailRow label={t('form.city')} value={client.city} />
                        </div>
                        <DetailRow label={t('form.state')} value={client.state} />

                        {client.profiles && client.profiles.length > 0 && (
                            <div className="space-y-2 pt-4">
                               <h3 className="font-semibold flex items-center gap-2"><UserCheck className="w-5 h-5" />{t('form.profiles')}</h3>
                               <div className="flex flex-wrap gap-2">
                                   {client.profiles.map(p => (
                                       <Badge key={p} variant="secondary" className="font-normal">{t_profiles(p)}</Badge>
                                   ))}
                               </div>
                           </div>
                        )}
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="button" onClick={() => onOpenChange(false)}>{t('form.close')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function AgendaPage() {
    const t = useTranslations("AgendaPage");
    const t_profiles = useTranslations("Profiles");
    const { toast } = useToast();
    const [clients, setClients] = useState<(ClientData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<ClientData & { id: string } | null>(null);
    const [viewingClient, setViewingClient] = useState<ClientData & { id: string } | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // States for import flow
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(isImportModalOpen);
    const [previewData, setPreviewData] = useState<Partial<ClientData>[]>([]);
    const [isPreviewing, setIsPreviewing] = useState(false);
    
    // States for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [profileFilter, setProfileFilter] = useState("all");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    // Pagination states
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Selection states
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);


    const fetchClients = async () => {
        setLoading(true);
        try {
            const storedClients = await getClients();
            const clientsWithDateObjects = storedClients.map(client => {
                let createdAtDate: Date | undefined = undefined;
                if (client.createdAt) {
                    // Firestore timestamps can be objects with toDate(), or strings, or already Dates.
                    if (typeof (client.createdAt as { toDate: () => Date } ).toDate === 'function') {
                        createdAtDate = (client.createdAt as { toDate: () => Date }).toDate();
                    } else if (typeof client.createdAt === 'string' || typeof client.createdAt === 'number') {
                        createdAtDate = new Date(client.createdAt);
                    } else if (client.createdAt instanceof Date) {
                        createdAtDate = client.createdAt;
                    }
                }
                return { ...client, createdAt: createdAtDate };
            });

            setClients(clientsWithDateObjects.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));

        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const name = client.name || client.nomeFantasia || client.razaoSocial || '';
            const doc = client.documentNumber || '';
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch = searchTerm ? 
                name.toLowerCase().includes(searchLower) || 
                doc.includes(searchLower) : 
                true;

            const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
            
            const matchesProfile = profileFilter === 'all' || client.profiles?.includes(profileFilter as ClientProfile);

            const clientDate = client.createdAt ? new Date(client.createdAt as Date | string | number) : null;
            const matchesDate = (!startDate || (clientDate && clientDate >= startDate)) &&
                                (!endDate || (clientDate && clientDate <= endDate));


            return matchesSearch && matchesStatus && matchesProfile && matchesDate;
        })
    }, [clients, searchTerm, statusFilter, profileFilter, startDate, endDate]);

    const paginatedClients = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredClients.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredClients, page, rowsPerPage]);

    const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

    const kpiValues = useMemo(() => {
        const total = clients.length;
        const active = clients.filter(c => c.status === 'Ativo').length;
        const inactive = clients.filter(c => c.status === 'Inativo').length;
        return { total, active, inactive };
    }, [clients]);

    const handleFormSave = () => {
        setIsFormOpen(false);
        setEditingClient(null);
        fetchClients(); // Refresh client list
    }
    
    const handleNewClient = () => {
        setEditingClient(null);
        setIsFormOpen(true);
    }
    
    const handleEditClient = (client: ClientData & { id: string }) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    const handleViewClient = (client: ClientData & { id: string }) => {
        setViewingClient(client);
        setIsViewOpen(true);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setProfileFilter('all');
        setStartDate(undefined);
        setEndDate(undefined);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFilePreview(file);
        }
    };

    const handleFilePreview = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, { defval: "" });

                const parsedData = json.map(row => {
                    const profiles: ClientProfile[] = [];
                    for (const profileKey of clientProfileSchema.options) {
                        const profileName = t_profiles(profileKey);
                        if (String(row[profileName]).toLowerCase() === 'true') {
                            profiles.push(profileKey);
                        }
                    }

                    const docNumberRaw = row['Documento'] || row['CPF/CNPJ'] || "";
                    let docNumber = String(docNumberRaw);
                    // Handle scientific notation for documents
                    if (typeof docNumberRaw === 'number') {
                        docNumber = docNumberRaw.toLocaleString('fullwide', {useGrouping:false});
                    }

                    return {
                        id: String(row['id'] || ''),
                        firstName: String(row['Nome'] || ''),
                        lastName: String(row['Sobrenome'] || ''),
                        email: String(row['Email'] || ''),
                        mobile: String(row['Celular'] || ''),
                        phone: String(row['Telefone'] || ''),
                        status: clientStatusSchema.options.includes(String(row['Situação']) as ClientStatus) ? String(row['Situação']) as ClientStatus : 'Ativo',
                        accountType: String(row['Tipo'] || 'pf').toLowerCase() as 'pf' | 'pj',
                        documentNumber: docNumber.replace(/\D/g, ''),
                        documentType: String(row['Tipo documento'] || ''),
                        complement: String(row['Complemento'] || ''),
                        neighborhood: String(row['Bairro'] || ''),
                        number: String(row['Número'] || ''),
                        postalCode: String(row['Código postal'] || ''),
                        street: String(row['Rua'] || ''),
                        stateRegistration: String(row['Registro estadual'] || ''),
                        city: String(row['Cidade'] || ''),
                        state: String(row['Estado'] || ''),
                        country: String(row['País'] || 'Brasil'),
                        profiles: profiles,
                        razaoSocial: String(row['Razão Social'] || row['Nome'] || ''),
                        nomeFantasia: String(row['Nome Fantasia'] || row['Nome'] || ''),
                    } as Partial<ClientData>;
                });
                
                setPreviewData(parsedData);
                setIsPreviewing(true); // Open preview dialog
                setIsImportModalOpen(false); // Close initial import dialog

            } catch (error) {
                console.error("Failed to parse file:", error);
                toast({ variant: 'destructive', title: t('importModal.importError.title'), description: t('importModal.importError.description') });
            } finally {
                setIsImporting(false);
            }
        };

        reader.onerror = () => {
             toast({ variant: 'destructive', title: t('importModal.importError.title'), description: t('importModal.importError.readError') });
             setIsImporting(false);
        };
        
        reader.readAsArrayBuffer(file);
    };

    const handleConfirmImport = async () => {
        setIsImporting(true);
        try {
            const allClients = await getClients();
            const clientsByDoc = new Map(allClients.map(c => [c.documentNumber, c]));

            let updatedCount = 0;
            let createdCount = 0;

            for (const clientData of previewData) {
                const docNumber = clientData.documentNumber;
                let existingClient = clientData.id ? clients.find(c => c.id === clientData.id) : undefined;
                if (!existingClient && docNumber) {
                    existingClient = clientsByDoc.get(docNumber);
                }
                
                if (existingClient && existingClient.id) {
                    await updateClient(existingClient.id, clientData as ClientData);
                    updatedCount++;
                } else {
                    delete clientData.id; // Ensure new clients don't have a pre-set ID
                    await addClient(clientData as ClientData);
                    createdCount++;
                }
            }
            
            toast({ title: t('importModal.importSuccess.title'), description: t('importModal.importSuccess.description', { created: createdCount, updated: updatedCount }) });
            fetchClients();

        } catch (error) {
            console.error("Failed to import data:", error);
            toast({ variant: 'destructive', title: t('importModal.importError.title'), description: t('importModal.importError.description') });
        } finally {
            setIsImporting(false);
            setIsPreviewing(false);
            setPreviewData([]);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };


    const handleExportCSV = () => {
        const dataToExport = filteredClients.map(client => {
            const row: Record<string, string | boolean> = {
                'id': client.id,
                'Nome': client.firstName || '',
                'Sobrenome': client.lastName || '',
                'Email': client.email || '',
                'Celular': client.mobile || '',
                'Telefone': client.phone || '',
                'Data criação': client.createdAt ? format(new Date(client.createdAt as Date | string | number), "yyyy-MM-dd HH:mm:ss") : '',
                'Situação': client.status || '',
                'Tipo': client.accountType || '',
                'Tipo de documento': client.documentType || '',
                'CPF/CNPJ': client.documentNumber || '',
                'Complemento': client.complement || '',
                'Bairro': client.neighborhood || '',
                'Número': client.number || '',
                'Código postal': client.postalCode || '',
                'Rua': client.street || '',
                'Registro estadual': client.stateRegistration || '',
                'Cidade': client.city || '',
                'Estado': client.state || '',
                'País': client.country || '',
            };
            // Add profile columns
            clientProfileSchema.options.forEach(profile => {
                row[t_profiles(profile)] = client.profiles?.includes(profile) ? 'TRUE' : 'FALSE';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
        XLSX.writeFile(workbook, "clientes.xlsx");
    };

    const handleDownloadTemplate = () => {
         const headers = [
            'id', 'Nome', 'Sobrenome', 'Email', 'Celular', 'Telefone', 
            'Situação', 'Tipo', 'Tipo de documento', 'CPF/CNPJ',
            'Complemento', 'Bairro', 'Número', 'Código postal', 'Rua', 
            'Registro estadual', 'Cidade', 'Estado', 'País',
            ...clientProfileSchema.options.map(p => t_profiles(p as ClientProfile))
        ];
        const worksheet = XLSX.utils.json_to_sheet([{}], { header: headers });
        // Remove the empty data row
        XLSX.utils.sheet_add_aoa(worksheet, [], { origin: 'A2' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo de Importação");
        XLSX.writeFile(workbook, "modelo_importacao_clientes.xlsx");
    }

     const handleSelectClient = (clientId: string, checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedClients((prev) => [...prev, clientId]);
        } else {
            setSelectedClients((prev) => prev.filter((id) => id !== clientId));
        }
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedClients(paginatedClients.map((c) => c.id));
        } else {
            setSelectedClients([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedClients.length === 0) return;
        try {
            await deleteClients(selectedClients);
            toast({ title: t('actions.bulkDeleteSuccess', { count: selectedClients.length }) });
            fetchClients();
            setSelectedClients([]);
        } catch (error) {
            toast({ variant: 'destructive', title: t('actions.deleteError') });
            console.error("Failed to bulk delete clients:", error);
        } finally {
            setIsBulkDeleteDialogOpen(false);
        }
    };


    if (loading && clients.length === 0) {
        return (
            <AppShell>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AppShell>
        )
    }

    return (
        <AppShell>
            {/* Header com KPIs e Ações */}
            <div className="space-y-4">
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('description')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" /> {t('actions.downloadCsv')}</Button>
                        <AlertDialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <FileUp className="mr-2 h-4 w-4"/>
                                    {t('actions.importCsv')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('importModal.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t.rich('importModal.description', {
                                            code: (chunks) => <code className="font-mono bg-muted p-1 rounded-sm text-xs">{chunks}</code>
                                        })}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4 space-y-2">
                                    <Button className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                                        {t('importModal.selectFile')}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".xlsx, .csv"
                                        />
                                    </Button>
                                    <Button variant="secondary" className="w-full" onClick={handleDownloadTemplate}>
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('importModal.downloadTemplate')}
                                    </Button>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('importModal.cancel')}</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleNewClient}><PlusCircle className="mr-2 h-4 w-4" /> {t('actions.new')}</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>{editingClient ? t('form.editClientTitle') : t('form.newClientTitle')}</DialogTitle>
                                    <DialogDescription>{t('form.newClientDescription')}</DialogDescription>
                                </DialogHeader>
                                <ClientForm onSave={handleFormSave} clientToEdit={editingClient} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KpiCard title={t('kpi.total')} value={kpiValues.total} icon={<Users className="h-4 w-4" />} color="bg-blue-500" />
                    <KpiCard title={t('kpi.active')} value={kpiValues.active} icon={<UserCheck className="h-4 w-4" />} color="bg-green-500" />
                    <KpiCard title={t('kpi.inactive')} value={kpiValues.inactive} icon={<UserX className="h-4 w-4" />} color="bg-red-500" />
                </div>
            </div>

            {/* Barra de Filtros */}
             <Card className="mt-6">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-grow">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder={t('filters.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full sm:w-[300px]"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-auto min-w-[150px]"><SelectValue placeholder={t('filters.statusPlaceholder')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                                {clientStatusSchema.options.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Select value={profileFilter} onValueChange={setProfileFilter}>
                            <SelectTrigger className="w-full sm:w-auto min-w-[150px]"><SelectValue placeholder={t('filters.profilePlaceholder')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allProfiles')}</SelectItem>
                                {clientProfileSchema.options.map(profile => (
                                     <SelectItem key={profile} value={profile}>{t_profiles(profile)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "dd/MM/yyyy") : <span>{t('filters.startDate')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                        </Popover>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "dd/MM/yyyy") : <span>{t('filters.endDate')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                        </Popover>
                        <Button variant="ghost" onClick={resetFilters} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <Trash2 className="h-4 w-4" /> {t('filters.clear')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de Clientes */}
            <div className="rounded-lg border bg-card">
              <div className="flex items-center p-4">
                  {selectedClients.length > 0 && (
                      <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                              {t('actions.selected', { count: selectedClients.length })}
                          </span>
                          <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('actions.deleteSelected')}
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>{t('actions.bulkDeleteConfirmTitle')}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          {t('actions.bulkDeleteConfirmDescription', { count: selectedClients.length })}
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleBulkDelete}>
                                          {t('actions.delete')}
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  )}
              </div>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-[40px]">
                              <Checkbox
                                  checked={selectedClients.length > 0 && paginatedClients.length > 0 && selectedClients.length === paginatedClients.length}
                                  onCheckedChange={(checked) => handleSelectAll(checked)}
                                  aria-label="Select all"
                               />
                          </TableHead>
                          <TableHead>{t('table.name')}</TableHead>
                          <TableHead className="hidden sm:table-cell">{t('table.document')}</TableHead>
                          <TableHead className="hidden md:table-cell">{t('table.phone')}</TableHead>
                          <TableHead className="hidden lg:table-cell">{t('table.email')}</TableHead>
                          <TableHead>{t('table.status')}</TableHead>
                          <TableHead className="w-[64px] text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {loading ? (
                          <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                              </TableCell>
                          </TableRow>
                      ) : paginatedClients.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                  {t('table.noClients')}
                              </TableCell>
                          </TableRow>
                      ) : (
                          paginatedClients.map(client => (
                              <TableRow key={client.id} data-state={selectedClients.includes(client.id) && "selected"}>
                                  <TableCell>
                                      <Checkbox
                                          checked={selectedClients.includes(client.id)}
                                          onCheckedChange={(checked) => handleSelectClient(client.id, checked)}
                                          aria-label={`Select client ${client.name}`}
                                      />
                                  </TableCell>
                                  <TableCell className="font-medium text-sm">{client.name || client.nomeFantasia || client.razaoSocial}</TableCell>
                                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{client.documentNumber}</TableCell>
                                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{client.mobile}</TableCell>
                                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{client.email}</TableCell>
                                  <TableCell><Badge variant={client.status === 'Ativo' ? 'default' : 'destructive'} className="text-xs font-normal">{client.status}</Badge></TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewClient(client)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                {t('actions.view')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEditClient(client)}>{t('actions.edit')}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
            </div>
             {/* Pagination */}
            <div className="flex items-center justify-between pt-4 text-sm">
                <div className="text-muted-foreground">
                   {t('pagination.showing', {
                        start: Math.min((page - 1) * rowsPerPage + 1, filteredClients.length),
                        end: Math.min(page * rowsPerPage, filteredClients.length),
                        total: filteredClients.length,
                   })}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">{t('pagination.rowsPerPage')}</p>
                        <Select
                            value={`${rowsPerPage}`}
                            onValueChange={(value) => {
                                setRowsPerPage(Number(value));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={rowsPerPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="font-medium text-sm">
                        {t('pagination.page', { page: totalPages > 0 ? page : 0, totalPages: totalPages })}
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(1)} disabled={page === 1}><span className="sr-only">Go to first page</span><ChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(p => p - 1)} disabled={page === 1}><span className="sr-only">Go to previous page</span><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(p => p + 1)} disabled={page === totalPages || totalPages === 0}><span className="sr-only">Go to next page</span><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0}><span className="sr-only">Go to last page</span><ChevronsRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>

            <ViewClientDialog client={viewingClient} isOpen={isViewOpen} onOpenChange={setIsViewOpen} />

            <Dialog open={isPreviewing} onOpenChange={setIsPreviewing}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{t('importModal.previewTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('importModal.previewDescription', { count: previewData.length })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData.map((client, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{client.firstName}</TableCell>
                                        <TableCell>{client.documentNumber}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsPreviewing(false)}>{t('importModal.cancel')}</Button>
                        <Button onClick={handleConfirmImport} disabled={isImporting}>
                            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('importModal.confirmImport')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppShell>
    );
}
    