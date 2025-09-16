"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Temporarily disabled AI functionality
// import { getImpactSuggestions, type ImpactSuggestionsInput } from '@/ai/flows/ai-impact-suggestions';
import type { FormData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

interface AiSuggestionsProps {
    formData: FormData;
}

export default function AiSuggestions({ formData }: AiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const t = useTranslations('AiSuggestions');

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            setSuggestions(null);

            const eventData = `
                Event: ${formData.eventName}
                Participants: ${JSON.stringify(formData.participants)}
                Visitors: ${formData.visitors}
                Duration: ${formData.durationDays} days
            `.trim().replace(/^\s+/gm, '');

            // Temporarily using static suggestions instead of AI
            try {
                // Simulate AI suggestions with static content
                const staticSuggestions = `* Considere usar materiais recicláveis para decoração e sinalização
* Implemente um sistema de coleta seletiva durante o evento
* Ofereça opções de transporte sustentável para os participantes
* Use energia renovável sempre que possível
* Reduza o uso de papel através de soluções digitais
* Escolha fornecedores locais para reduzir a pegada de carbono
* Implemente medidas de economia de água
* Considere compensação de carbono para o evento`;
                
                setSuggestions(staticSuggestions);
            } catch (error) {
                console.error("Error generating suggestions:", error);
                toast({
                  variant: "destructive",
                  title: t('error.title'),
                  description: t('error.description'),
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (formData) {
            fetchSuggestions();
        }
    }, [formData, toast, t]);
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">{t('loading')}</p>
            </div>
        );
    }
    
    if (!suggestions) {
        return (
             <Alert variant="destructive">
                <AlertTitle>{t('error.title')}</AlertTitle>
                <AlertDescription>
                {t('error.loadFail')}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><Lightbulb className="mr-2 text-primary" /> {t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-sm">
                    {suggestions.split('\n').filter(line => line.trim() !== '').map((line, index) => {
                        const isListItem = line.startsWith('* ') || line.startsWith('- ');
                        const content = isListItem ? line.substring(2) : line;
                        return (
                            <p key={index} className="flex items-start">
                                {isListItem && <span className="mr-3 mt-1 text-primary">🌱</span>}
                                <span>{content}</span>
                            </p>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
