"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getImpactSuggestions, type ImpactSuggestionsInput } from '@/ai/flows/ai-impact-suggestions';
import type { FormData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AiSuggestionsProps {
    formData: FormData;
}

export default function AiSuggestions({ formData }: AiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            setSuggestions(null);

            const eventData = `
                Event: ${formData.eventName}
                Participants: ${formData.participants}
                Duration: ${formData.durationDays} days
                ${formData.venueSizeSqm ? `Venue Size: ${formData.venueSizeSqm} m²` : ''}
                ${formData.travelKm ? `Average Travel: ${formData.travelKm} km per participant` : ''}
                ${formData.wasteKg ? `Estimated Waste: ${formData.wasteKg} kg` : ''}
                ${formData.waterLiters ? `Estimated Water Usage: ${formData.waterLiters} liters` : ''}
                ${formData.energyKwh ? `Estimated Energy Usage: ${formData.energyKwh} kWh` : ''}
            `.trim().replace(/^\s+/gm, '');

            const input: ImpactSuggestionsInput = {
                eventData,
                currentPractices: formData.currentPractices || "No specific sustainability practices are currently in place.",
            };

            try {
                const result = await getImpactSuggestions(input);
                setSuggestions(result.suggestions);
            } catch (error) {
                console.error("Error fetching AI suggestions:", error);
                toast({
                  variant: "destructive",
                  title: "AI Error",
                  description: "Could not fetch suggestions. Please try again later.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (formData) {
            fetchSuggestions();
        }
    }, [formData, toast]);
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Generating AI-powered insights...</p>
            </div>
        );
    }
    
    if (!suggestions) {
        return (
             <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                Failed to load AI suggestions. Please check your connection or try again later.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><Lightbulb className="mr-2 text-primary" /> AI-Powered Suggestions</CardTitle>
                <CardDescription>Actionable ideas to reduce your event's environmental footprint.</CardDescription>
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
