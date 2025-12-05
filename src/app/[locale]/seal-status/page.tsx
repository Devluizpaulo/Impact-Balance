

"use client";

import { useEffect, useState, startTransition, useRef } from "react";
import * as XLSX from 'xlsx';
import { getEvents, addEvent, getClients, addClient } from "@/lib/event-storage";
import type { EventRecord, NewEventRecord, ClientData, ParticipantData } from "@/lib/types";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSearch, Loader2, Upload, FileUp, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


type SealStatus = 'valid' | 'expiring' | 'expired';

interface Seal extends EventRecord {
    expiryDate: Date;
    status: SealStatus;
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


export default function SealStatusPage() {
    const t = useTranslations("SealStatusPage");
    const [seals, setSeals] = useState<Seal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchEvents = async () => {
        setLoading(true);
        const storedEvents = await getEvents();
        const processedSeals = storedEvents.map(event => {
            const issueDate = new Date(event.timestamp);
            const expiryDate = new Date(new Date(issueDate).setFullYear(issueDate.getFullYear() + 1));
            return {
                ...event,
                expiryDate,
                status: getStatus(expiryDate),
            };
        }).sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
        setSeals(processedSeals);
        setLoading(false);
    };

    useEffect(() => {
        startTransition(() => {
            fetchEvents();
        });
    }, []);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleFileUpload = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet);

                const existingClients = await getClients();
                const existingClientNames = new Set(existingClients.map(c => (c.razaoSocial || c.nomeFantasia || c.name || '').trim().toLowerCase()));
                const existingClientPhones = new Set(existingClients.map(c => (c.mobile || c.phone || '').replace(/\D/g, '')));


                let importedCount = 0;
                for (const row of json) {
                    const clientName = String(row['Cliente'] || '');
                    const phone = String(row['Telefone'] || '');

                     // Check if client already exists
                    const normalizedClientName = clientName.trim().toLowerCase();
                    const normalizedPhone = phone.replace(/\D/g, '');
                    
                    let clientExists = false;
                    if (normalizedClientName) {
                        clientExists = existingClientNames.has(normalizedClientName);
                    }
                    if (!clientExists && normalizedPhone) {
                        clientExists = existingClientPhones.has(normalizedPhone);
                    }

                    // If client does not exist, add to agenda
                    if (clientName && !clientExists) {
                        const newClient: ClientData = {
                            accountType: 'pj', // Default to PJ
                            documentType: 'CNPJ', // Default
                            documentNumber: 'N/A',
                            razaoSocial: clientName,
                            nomeFantasia: clientName,
                            name: clientName,
                            firstName: clientName,
                            lastName: '',
                            phone: phone,
                            mobile: phone || 'N/A',
                            email: 'email@padrao.com',
                            postalCode: 'N/A',
                            country: 'Brasil',
                            state: String(row['UF'] || 'N/A'),
                            city: 'N/A',
                            street: 'N/A',
                            complement: '',
                            neighborhood: 'N/A',
                            number: 'N/A',
                            status: 'Ativo',
                        };
                        await addClient(newClient);
                        existingClientNames.add(normalizedClientName);
                        if(normalizedPhone) existingClientPhones.add(normalizedPhone);
                    }


                    const eventName = row['Pedido'] || row['Event Name'] || row['eventName'] || 'Selo Importado';
                    const ucsString = String(row['Quantidade'] || row['UCS'] || row['ucs'] || '0');
                    const ucs = parseInt(ucsString.replace('UCS', '').trim(), 10) || 0;
                    
                    let timestamp = new Date().getTime();
                    const dateValue = row['Data'] || row['Date'] || row['date'] || row['timestamp'];
                     if (typeof dateValue === 'number') {
                        // Excel date number (days since 1900-01-01)
                        timestamp = new Date(Date.UTC(1900, 0, dateValue - 1)).getTime();
                    } else if (typeof dateValue === 'string') {
                        const parsedDate = new Date(dateValue);
                        if (!isNaN(parsedDate.getTime())) {
                            timestamp = parsedDate.getTime();
                        } else {
                            // Try parsing DD/MM/YYYY HH:mm:ss
                            const parts = dateValue.match(/(\d+)/g);
                            if (parts && parts.length >= 3) {
                                // new Date(year, monthIndex, day, hours, minutes, seconds)
                                const year = parseInt(parts[2], 10);
                                const finalYear = year < 100 ? 2000 + year : year;
                                const ts = new Date(finalYear, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), parseInt(parts[3] || '0', 10), parseInt(parts[4] || '0', 10), parseInt(parts[5] || '0', 10));
                                if(!isNaN(ts.getTime())) {
                                  timestamp = ts.getTime();
                                }
                            }
                        }
                    }
                    
                    if (isNaN(timestamp)) {
                      console.warn("Skipping row with invalid date:", row);
                      continue;
                    }

                    const totalString = String(row['Total'] || '0');
                    const totalCost = parseFloat(totalString.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;

                    const newRecord: NewEventRecord = {
                        formData: { 
                            eventName: String(eventName),
                            participants: {} as ParticipantData,
                            clientName: clientName,
                            parcProg: String(row['PARC/PROG'] || ''),
                            uf: String(row['UF'] || ''),
                            taxa: parseFloat(String(row['Taxa'] || '0').replace(',', '.')) || 0,
                            total: totalCost,
                            telefone: phone,
                        },
                        results: {
                            totalUCS: Number(ucs),
                            totalCost: totalCost, 
                            // Mark as legacy by setting totalParticipants to 0
                            totalParticipants: 0, 
                            totalCostUSD: 0, totalCostEUR: 0,
                            directUcs: Number(ucs), directCost: 0, indirectCost: 0, ucsPerParticipant: 0,
                            costPerParticipant: 0, costPerParticipantDay: 0, costPerParticipantHour: 0,
                            breakdown: [], indirectBreakdown: [],
                            equivalences: { dailyUCS: 0, hourlyUCS: 0, gdpPercentage: 0 },
                            benefits: { preservedNativeForestArea: 0, carbonEmissionAvoided: 0, storedWood: 0, faunaSpeciesPreservation: 0, floraSpeciesPreservation: 0, hydrologicalFlowPreservation: 0 }
                        },
                        archived: false,
                    };
                    await addEvent(newRecord, timestamp);
                    importedCount++;
                }

                toast({ title: t('importSuccess.title'), description: t('importSuccess.description', { count: importedCount }) });
                fetchEvents();

            } catch (error) {
                console.error("Failed to import file:", error);
                toast({ variant: 'destructive', title: t('importError.title'), description: t('importError.description') });
            } finally {
                setIsImporting(false);
                // Reset file input
                if(fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };

        reader.onerror = () => {
             toast({ variant: 'destructive', title: t('importError.title'), description: t('importError.readError') });
             setIsImporting(false);
        };
        
        reader.readAsArrayBuffer(file);
    };

    const handleExportTemplate = () => {
        const headers = [
            "Pedido",
            "Data",
            "Cliente",
            "Telefone",
            "PARC/PROG",
            "UF",
            "Quantidade",
            "Taxa",
            "Total"
        ];
        const worksheet = XLSX.utils.json_to_sheet([{}], { header: headers });
        // Remove the empty data row
        XLSX.utils.sheet_add_aoa(worksheet, [], { origin: 'A2' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo de Importação");
        XLSX.writeFile(workbook, "modelo_importacao_selos.xlsx");
    };

    const statusVariant: Record<SealStatus, "default" | "destructive" | "secondary"> = {
        valid: 'default',
        expiring: 'secondary',
        expired: 'destructive'
    };

    return (
        <AppShell>
            <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isImporting}>
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileUp className="mr-2 h-4 w-4"/>}
                            {t('importButton')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('importModal.title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t.rich('importModal.description', {
                                    span: (chunks) => <span className="block mt-2">{chunks}</span>,
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
                            <Button variant="secondary" className="w-full" onClick={handleExportTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('importModal.downloadTemplate')}
                            </Button>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('importModal.cancel')}</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : seals.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                            <FileSearch className="w-16 h-16 text-muted-foreground/30" />
                            <p>{t('noSeals')}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">{t('table.eventName')}</TableHead>
                                    <TableHead>{t('table.issueDate')}</TableHead>
                                    <TableHead>{t('table.expiryDate')}</TableHead>
                                    <TableHead className="text-right">{t('table.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {seals.map((seal) => (
                                    <TableRow key={seal.id}>
                                        <TableCell className="font-medium">
                                            {seal.formData.eventName}
                                        </TableCell>
                                        <TableCell>{new Date(seal.timestamp).toLocaleDateString()}</TableCell>
                                        <TableCell>{seal.expiryDate.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={statusVariant[seal.status]}>{t(`status.${seal.status}`)}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </AppShell>
    );
}

