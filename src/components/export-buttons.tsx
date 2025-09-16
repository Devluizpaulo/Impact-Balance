"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalculationResult, FormData } from "@/lib/types";
import { FileDown, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


interface ExportButtonsProps {
    results: CalculationResult;
    formData: FormData;
}

export default function ExportButtons({ results, formData }: ExportButtonsProps) {
    const { toast } = useToast();
    const t = useTranslations('ExportButtons');
    const [isExporting, setIsExporting] = useState(false);

    const handlePdfExport = async () => {
        setIsExporting(true);
        const reportElement = document.getElementById('executive-report');
        if (!reportElement) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not find report content to export.",
            });
            setIsExporting(false);
            return;
        }

        try {
            const canvas = await html2canvas(reportElement, {
              scale: 2, 
              useCORS: true, 
              backgroundColor: null,
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            
            const fileName = `${formData.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_impact_report.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({
                variant: "destructive",
                title: t('pdfError.title'),
                description: t('pdfError.description'),
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleExcelExport = () => {
        toast({
            title: t('inDevelopment.title', { format: 'Excel' }),
            description: t('inDevelopment.description'),
        });
        console.log(`Exporting data for event "${formData.eventName}" to Excel:`, { formData, results });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                     {t('export')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handlePdfExport} disabled={isExporting}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('toPdf')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExcelExport}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {t('toExcel')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
