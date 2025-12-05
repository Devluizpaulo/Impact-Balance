
"use client";

import { useEffect, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { clientSchema, type ClientData } from "@/lib/types";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building, User, Landmark, PlusCircle, Download, Users, UserCheck, UserX, Search, Trash2, CalendarIcon, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addClient, getClients } from "@/lib/event-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// --- Sub-components for the new UI ---

const KpiCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">{title}</CardTitle>
            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white", color)}>
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</div>
        </CardContent>
    </Card>
);

const ClientForm = ({ onSave, clientToEdit }: { onSave: () => void, clientToEdit?: ClientData | null }) => {
    const t = useTranslations("AgendaPage");
    const { toast } = useToast();

    const form = useForm<ClientData>({
        resolver: zodResolver(clientSchema),
        defaultValues: clientToEdit || {
            accountType: 'pj',
            documentType: 'CNPJ',
            country: 'Brasil',
        },
    });

     useEffect(() => {
        if (clientToEdit) {
            form.reset(clientToEdit);
        }
    }, [clientToEdit, form]);

    const accountType = form.watch('accountType');

    useEffect(() => {
        form.setValue('documentType', accountType === 'pj' ? 'CNPJ' : 'CPF');
    }, [accountType, form]);

    const onSubmit = async (data: ClientData) => {
        try {
            // TODO: Implement update logic if clientToEdit exists
            await addClient(data);
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
                                <FormField control={form.control} name="documentType" render={({ field }) => (<FormItem><FormLabel>{t("form.documentType")} *</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="documentNumber" render={({ field }) => (<FormItem><FormLabel>{accountType === 'pj' ? 'CNPJ' : 'CPF'} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                {accountType === 'pj' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="razaoSocial" render={({ field }) => (<FormItem><FormLabel>{t("form.razaoSocial")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="nomeFantasia" render={({ field }) => (<FormItem><FormLabel>{t("form.nomeFantasia")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                )}
                                {accountType === 'pf' && (<FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t("form.fullName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t("form.phone")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel>{t("form.mobile")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                                    <FormField control={form.control} name="cep" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                    <Button type="button" variant="ghost" onClick={() => onSave()}>{t("form.cancel")}</Button>
                    <Button type="submit">{clientToEdit ? t('form.update') : t('form.save')}</Button>
                </DialogFooter>
            </form>
        </Form>
    )
};


export default function AgendaPage() {
    const t = useTranslations("AgendaPage");
    const [clients, setClients] = useState<(ClientData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<ClientData & { id: string } | null>(null);
    
    // States for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [profileFilter, setProfileFilter] = useState("all");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    // Pagination states
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const storedClients = await getClients();
            setClients(storedClients);
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

            // TODO: Implement other filters (status, profile, date) when data model supports it
            // For now, just filtering by search term
            return matchesSearch;
        })
    }, [clients, searchTerm, statusFilter, profileFilter, startDate, endDate]);

    const paginatedClients = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredClients.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredClients, page, rowsPerPage]);

    const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

    const kpiValues = useMemo(() => {
        // TODO: Replace with actual active/inactive logic when data is available
        const total = clients.length;
        const active = Math.floor(total * 0.88); // Placeholder
        const inactive = total - active; // Placeholder
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

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setProfileFilter('all');
        setStartDate(undefined);
        setEndDate(undefined);
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
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> {t('actions.downloadCsv')}</Button>
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
                                className="pl-10 w-full"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('filters.statusPlaceholder')} /></SelectTrigger>
                            <SelectContent><SelectItem value="all">{t('filters.allStatus')}</SelectItem></SelectContent>
                        </Select>
                         <Select value={profileFilter} onValueChange={setProfileFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('filters.profilePlaceholder')} /></SelectTrigger>
                            <SelectContent><SelectItem value="all">{t('filters.allProfiles')}</SelectItem></SelectContent>
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
                        <Button variant="ghost" onClick={resetFilters} className="flex items-center gap-2 text-muted-foreground">
                            <Trash2 className="h-4 w-4" /> {t('filters.clear')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de Clientes */}
            <div className="rounded-lg border">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>{t('table.name')}</TableHead>
                          <TableHead className="hidden sm:table-cell">{t('table.document')}</TableHead>
                          <TableHead className="hidden md:table-cell">{t('table.phone')}</TableHead>
                          <TableHead className="hidden lg:table-cell">{t('table.email')}</TableHead>
                          <TableHead>{t('table.status')}</TableHead>
                          <TableHead className="w-[64px] text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {loading && clients.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                              </TableCell>
                          </TableRow>
                      ) : paginatedClients.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                  {t('table.noClients')}
                              </TableCell>
                          </TableRow>
                      ) : (
                          paginatedClients.map(client => (
                              <TableRow key={client.id}>
                                  <TableCell className="font-medium">{client.name || client.nomeFantasia || client.razaoSocial}</TableCell>
                                  <TableCell className="hidden sm:table-cell">{client.documentNumber}</TableCell>
                                  <TableCell className="hidden md:table-cell">{client.mobile}</TableCell>
                                  <TableCell className="hidden lg:table-cell">{client.email}</TableCell>
                                  <TableCell><Badge variant="default">{t('table.activeStatus')}</Badge></TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditClient(client)}>{t('actions.edit')}</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">{t('actions.delete')}</DropdownMenuItem>
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
                        <p>{t('pagination.rowsPerPage')}</p>
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
                    <div className="font-medium">
                        {t('pagination.page', { page: page, totalPages: totalPages })}
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(1)} disabled={page === 1}><span className="sr-only">Go to first page</span><ChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(p => p - 1)} disabled={page === 1}><span className="sr-only">Go to previous page</span><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><span className="sr-only">Go to next page</span><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPage(totalPages)} disabled={page === totalPages}><span className="sr-only">Go to last page</span><ChevronsRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
