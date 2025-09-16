
"use client"

import { useState } from "react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface ExportButtonsProps {
    results: CalculationResult;
    formData: FormData;
}

export default function ExportButtons({ results, formData }: ExportButtonsProps) {
    const { toast } = useToast();
    const t = useTranslations('ExportButtons');
    const t_calc = useTranslations('ImpactCalculator');
    const t_report = useTranslations('ExecutiveReport');
    const [isExporting, setIsExporting] = useState(false);

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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

    const handlePdfExport = async () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF() as jsPDFWithAutoTable;
            
            // --- PDF Header ---
            const img = new Image();
            img.src = '/logo.png';
            await new Promise(resolve => { img.onload = resolve; });

            const pageWidth = doc.internal.pageSize.width;
            const margin = 14;
            const logoWidth = 30; // Desired width
            const logoHeight = (img.height * logoWidth) / img.width; // Maintain aspect ratio
            const headerY = 20;

            // Add logo
            doc.addImage(img, 'PNG', margin, headerY, logoWidth, logoHeight);

            // Add title - Right Aligned
            doc.setFontSize(16);
            doc.setTextColor(30, 30, 30);
            const reportTitle = t_report('title');
            doc.text(reportTitle, pageWidth - margin, headerY + logoHeight / 2, { align: 'right' });
            
            // Separator line
            doc.setDrawColor(220, 220, 220); // Light gray
            doc.line(margin, headerY + logoHeight + 5, pageWidth - margin, headerY + logoHeight + 5);

            let finalY = headerY + logoHeight + 15;

            // Event Name - Centered and Highlighted
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(formData.eventName, pageWidth / 2, finalY, { align: 'center' });
            
            finalY += 10;
            
            // Reset font style
            doc.setFont('helvetica', 'normal');
            
            // Introduction Text
            doc.setFontSize(10);
            doc.setTextColor(100);
            const introText = doc.splitTextToSize(t_report('introduction'), pageWidth - (margin * 2));
            doc.text(introText, margin, finalY);

            finalY += (introText.length * 5) + 5;


            // --- Breakdown Table ---
            const tableData = results.breakdown.map(item => [
                participantCategories[item.category] || item.category,
                item.quantity,
                `${item.duration} ${t_calc(`participants.${item.durationUnit}` as any)}`,
                item.ucs.toFixed(0),
                formatCurrency(item.cost)
            ]);

            doc.autoTable({
                startY: finalY,
                head: [[t_report('table.participants'), t_report('table.quantity'), t_report('table.duration'), t_report('table.totalUCS'), t_report('table.directCost')]],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [22, 101, 52] }, // Primary color
                margin: { left: margin, right: margin }
            });
            
            finalY = (doc as any).lastAutoTable.finalY || 100;

            // --- Summary section ---
            finalY += 10;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(t_report('summaryTitle'), margin, finalY);
            
            finalY += 7;

            const summaryItems = [
              [t_report('totals.directUCScost'), formatCurrency(results.directCost)],
              [t_report('totals.indirectUCScost'), formatCurrency(results.indirectCost)],
              [t_report('totals.costPerParticipantDay'), formatCurrency(results.costPerParticipantDay)],
              [t_report('totals.costPerParticipantHour'), formatCurrency(results.costPerParticipantHour)],
            ];

            const totalsItems = [
                [t_report('totals.totalToCompensate'), `${results.totalUCS.toFixed(0)} UCS`],
                [t_report('totals.totalBudget'), formatCurrency(results.totalCost)],
            ];

            doc.autoTable({
                startY: finalY,
                body: summaryItems,
                theme: 'plain',
                styles: { fontSize: 10 },
                columnStyles: { 0: { cellWidth: 70 }, 1: { halign: 'right' } },
                tableWidth: 100,
                margin: { left: margin }
            });
            
            let lastY = (doc as any).lastAutoTable.finalY;

             doc.autoTable({
                startY: lastY,
                body: totalsItems,
                theme: 'plain',
                styles: { fontSize: 12, fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' }, 1: { halign: 'right', fontStyle: 'bold' } },
                tableWidth: 100,
                margin: { left: margin }
            });


            const fileName = `${formData.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_impact_report.pdf`;
            doc.save(fileName);

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
                { Item: t_report('totals.costPerParticipantDay'), Value: results.costPerParticipantDay },
                { Item: t_report('totals.costPerParticipantHour'), Value: results.costPerParticipantHour },
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
            XLSX.utils.book_append_sheet(wb, wsSummary, t('excel.summarySheet'));

            // Detailed Breakdown Sheet
            const directData = results.breakdown.map(item => ({
                [t('excel.category')]: participantCategories[item.category] || item.category,
                [t('excel.quantity')]: item.quantity,
                [t('excel.duration')]: `${item.duration} ${t_calc(`participants.${item.durationUnit}` as any)}`,
                [t('excel.ucs')]: item.ucs,
                [t('excel.cost')]: item.cost
            }));

             const indirectData = results.indirectBreakdown.map(item => ({
                [t('excel.category')]: indirectCostCategories[item.category] || item.category,
                [t('excel.quantity')]: 1,
                [t('excel.duration')]: '-',
                [t('excel.ucs')]: 0, // Indirect costs do not contribute UCS
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
