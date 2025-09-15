"use client"

import { Button } from "@/components/ui/button";
import { CalculationResult, FormData } from "@/lib/types";
import { FileDown, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl";


interface ExportButtonsProps {
    results: CalculationResult;
    formData: FormData;
}

export default function ExportButtons({ results, formData }: ExportButtonsProps) {
    const { toast } = useToast();
    const t = useTranslations('ExportButtons');

    const handleExport = (format: 'PDF' | 'Excel') => {
        toast({
            title: t('inDevelopment.title', { format }),
            description: t('inDevelopment.description'),
        });
        console.log(`Exporting data for event "${formData.eventName}" to ${format}:`, { formData, results });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" /> {t('export')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('PDF')}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('toPdf')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('Excel')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {t('toExcel')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
