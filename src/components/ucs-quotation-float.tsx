"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, X, RefreshCw } from "lucide-react";
import { getLatestUcsQuotation, subscribeLatestUcsQuotation, clearQuotationCache } from "@/lib/settings-storage";
import { cn } from "@/lib/utils";

export default function UcsQuotationFloat() {
  const [quotation, setQuotation] = useState<{ value: number; date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);


  const fetchQuotation = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (forceRefresh) {
        clearQuotationCache();
      }
      const q = await getLatestUcsQuotation();
      setQuotation(q);
      if (!q) {
        setError("Nenhuma cotação encontrada");
      }
    } catch (err) {
      console.error("Erro ao buscar cotação:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchQuotation(false);
  const handleForceRefresh = () => fetchQuotation(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    
    fetchQuotation();
    
    try {
      unsub = subscribeLatestUcsQuotation((q) => {
        setQuotation(q);
        setError(q ? null : "Nenhuma cotação encontrada");
        setLoading(false);
      });
    } catch (err) {
      console.error("Erro na assinatura:", err);
      setError("Erro na conexão em tempo real");
    }
    
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "transition-all duration-300 shadow-lg border-primary/20",
        isExpanded ? "w-80" : "w-auto"
      )}>
        <CardContent className="p-3">
          {!isExpanded ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border-primary/30"
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">UCS</span>
              {loading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : quotation ? (
                <span className="text-xs font-mono">
                  {formatCurrency(quotation.value)}
                </span>
              ) : (
                <span className="text-xs text-red-500">Erro</span>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Cotação UCS</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : error ? (
                <div className="space-y-2">
                  <div className="text-sm text-red-600 font-medium">
                    {error}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleForceRefresh}
                    className="w-full h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Tentar novamente
                  </Button>
                </div>
              ) : quotation ? (
                <div className="space-y-2">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(quotation.value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Atualizada em: {formatDate(quotation.date)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="w-full h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Atualizar
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Nenhuma cotação disponível
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
