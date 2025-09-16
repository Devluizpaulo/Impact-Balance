"use client"

import { useState } from "react";
import * as XLSX from 'xlsx';
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

const loadPdfLibraries = async () => {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);
  return { jsPDF, html2canvas };
};

interface ExportButtonsProps {
    results: CalculationResult;
    formData: FormData;
}

export default function ExportButtons({ results, formData }: ExportButtonsProps) {
    const { toast } = useToast();
    const t = useTranslations('ExportButtons');
    const t_calc = useTranslations('ImpactCalculator');
    const [isExporting, setIsExporting] = useState(false);

    const getActiveTabContentId = () => {
        const reportElement = document.getElementById('executive-report');
        if (!reportElement) return 'summary-content';
        const activeTabTrigger = reportElement.querySelector<HTMLButtonElement>('[role="tab"][data-state="active"]');
        return activeTabTrigger?.getAttribute('data-value') + '-content' || 'summary-content';
    }

    const handlePdfExport = async () => {
        setIsExporting(true);
        // We target a specific container meant for export to get a clean result
        const reportElement = document.getElementById('report-content-for-export');
        
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
            const { jsPDF, html2canvas } = await loadPdfLibraries();
            
            const canvas = await html2canvas(reportElement, {
              scale: 2, 
              useCORS: true, 
              backgroundColor: null,
              onclone: (document) => {
                // Ensure the background is dark for the screenshot
                const cloneBody = document.body;
                cloneBody.style.backgroundColor = '#1f2937'; // A dark background
                const report = document.getElementById('report-content-for-export');
                if(report) {
                  // remove buttons from clone
                  const exportButtons = report.querySelector('#export-buttons');
                  if (exportButtons) exportButtons.remove();
                }
              }
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
        setIsExporting(true);
        try {
            const wb = XLSX.utils.book_new();

            // Summary Sheet
            const summaryData = [
                { Item: t('excel.eventName'), Value: formData.eventName },
                {},
                { Item: t('excel.totalUCSToCompensate'), Value: results.totalUCS },
                { Item: t('excel.totalDirectCost'), Value: results.directCost },
                { Item: t('excel.totalIndirectCost'), Value: results.indirectCost },
                { Item: t('excel.totalBudget'), Value: results.totalCost },
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
            XLSX.utils.book_append_sheet(wb, wsSummary, t('excel.summarySheet'));

            const participantCategories: Record<string, string> = {
                organizers: t_calc('participants.organizersAndPromoters'), assemblers: t_calc('participants.assemblers'),
                suppliers: t_calc('participants.suppliers'), exhibitors: t_calc('participants.exhibitors'),
                supportTeam: t_calc('participants.supportTeam'), attendants: t_calc('participants.attendants'),
                support: t_calc('participants.support'), visitors: t_calc('participants.visitorsTitle'),
            };

            const indirectCostCategories: Record<string, string> = {
                ownershipRegistration: t_calc('indirectCosts.ownershipRegistration'),
                certificateIssuance: t_calc('indirectCosts.certificateIssuance'),
                websitePage: t_calc('indirectCosts.websitePage'),
            };

            // Detailed Breakdown Sheet
            const directData = results.breakdown.map(item => ({
                [t('excel.category')]: participantCategories[item.category] || item.category,
                [t('excel.quantity')]: item.quantity,
                [t('excel.duration')]: `${item.duration} ${item.durationUnit}`,
                [t('excel.ucs')]: item.ucs,
                [t('excel.cost')]: item.cost
            }));

             const indirectData = results.indirectBreakdown.map(item => ({
                [t('excel.category')]: indirectCostCategories[item.category] || item.category,
                [t('excel.quantity')]: 1,
                [t('excel.duration')]: '-',
                [t('excel.ucs')]: item.ucs,
                [t('excel.cost')]: item.cost
            }));

            const wsDetails = XLSX.utils.json_to_sheet([...directData, ...indirectData]);
            XLSX.utils.book_append_sheet(wb, wsDetails, t('excel.detailsSheet'));

            const fileName = `${formData.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_impact_report.xlsx`;
            XLSX.writeFile(wb, fileName);
        } catch (error) {
             console.error("Error generating Excel:", error);
            toast({
                variant: "destructive",
                title: t('excelError.title'),
                description: t('excelError.description'),
            });
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <div id="export-buttons">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-white border-gray-600 bg-gray-800/60 hover:bg-gray-700/60 hover:text-white" disabled={isExporting}>
                        {isExporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileDown className="mr-2 h-4 w-4" />
                        )}
                         {t('export')}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                    <DropdownMenuItem onClick={handlePdfExport} disabled={isExporting} className="focus:bg-gray-700">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('toPdf')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExcelExport} disabled={isExporting} className="focus:bg-gray-700">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        {t('toExcel')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
