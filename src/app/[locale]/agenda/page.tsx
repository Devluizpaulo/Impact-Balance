
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { clientSchema, type ClientData } from "@/lib/types";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building, User, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addClient, getClients } from "@/lib/event-storage";


export default function AgendaPage() {
    const t = useTranslations("AgendaPage");
    const { toast } = useToast();
    
    const [_clients, setClients] = useState<(ClientData & {id: string})[]>([]);
    const [loading, setLoading] = useState(true);

    const form = useForm<ClientData>({
        resolver: zodResolver(clientSchema),
        defaultValues: { 
            accountType: 'pj',
            documentType: 'CNPJ',
            country: 'Brasil',
        },
    });

    const accountType = form.watch('accountType');
    
    useEffect(() => {
        form.setValue('documentType', accountType === 'pj' ? 'CNPJ' : 'CPF');
    }, [accountType, form]);

    const fetchClients = async () => {
        setLoading(true);
        const storedClients = await getClients();
        setClients(storedClients); // This state is not used in the UI yet, but is ready for the list view
        setLoading(false);
    }

    useEffect(() => {
        fetchClients();
    }, []);

    const onSubmit = async (data: ClientData) => {
        try {
            await addClient(data);
            toast({ title: "Cliente salvo com sucesso!" });
            form.reset();
            fetchClients(); // Refresh the client list
        } catch(error) {
             console.error("Erro ao salvar cliente:", error);
             toast({ title: "Erro ao salvar cliente", variant: "destructive" });
        }
    };

    if (loading) {
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Coluna da Esquerda */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Conta</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="accountType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de conta:</FormLabel>
                                                <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="pf" id="pf" />
                                                        </FormControl>
                                                        <FormLabel htmlFor="pf" className="font-normal">Pessoa Física</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="pj" id="pj" />
                                                        </FormControl>
                                                        <FormLabel htmlFor="pj" className="font-normal">Pessoa Jurídica</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField control={form.control} name="documentType" render={({field}) => (
                                        <FormItem><FormLabel>Tipo de documento *</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name="documentNumber" render={({field}) => (
                                        <FormItem><FormLabel>{accountType === 'pj' ? 'CNPJ' : 'CPF'} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    {accountType === 'pj' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="razaoSocial" render={({field}) => (
                                                <FormItem><FormLabel>Razão Social</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="nomeFantasia" render={({field}) => (
                                                <FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                    )}
                                    {accountType === 'pf' && (
                                        <FormField control={form.control} name="name" render={({field}) => (
                                            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <FormField control={form.control} name="phone" render={({field}) => (
                                            <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="mobile" render={({field}) => (
                                            <FormItem><FormLabel>Celular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="email" render={({field}) => (
                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Coluna da Direita */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Building className="w-5 h-5"/> Endereço</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <FormField control={form.control} name="country" render={({field}) => (
                                            <FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="cep" render={({field}) => (
                                            <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <FormField control={form.control} name="state" render={({field}) => (
                                            <FormItem><FormLabel>Estado</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Mato Grosso">Mato Grosso</SelectItem></SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="city" render={({field}) => (
                                            <FormItem><FormLabel>Cidade</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Sinop">Sinop</SelectItem></SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="street" render={({field}) => (
                                        <FormItem><FormLabel>Rua</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="complement" render={({field}) => (
                                        <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <FormField control={form.control} name="neighborhood" render={({field}) => (
                                            <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="number" render={({field}) => (
                                            <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="w-5 h-5"/> Dados Bancários</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <FormField control={form.control} name="bank" render={({field}) => (
                                            <FormItem><FormLabel>Banco</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="banco1">Banco 1</SelectItem></SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="accountTypeBank" render={({field}) => (
                                            <FormItem><FormLabel>Tipo de Conta</FormLabel>
                                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="corrente">Conta Corrente</SelectItem><SelectItem value="poupanca">Conta Poupança</SelectItem></SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )} />
                                    </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <FormField control={form.control} name="agency" render={({field}) => (
                                            <FormItem><FormLabel>Agência</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="accountNumber" render={({field}) => (
                                            <FormItem><FormLabel>Conta</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost">Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Form>

        </AppShell>
    );
}
