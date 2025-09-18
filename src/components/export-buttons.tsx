
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
    const formatCurrencyUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    const formatCurrencyEUR = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);


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
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 15;

            // --- Load Images ---
            const logoImg = new Image();
            logoImg.src = '/logo.png';
            await new Promise(resolve => { logoImg.onload = resolve; });
            
            const seloImg = new Image();
            seloImg.src = '/selo.png';
            await new Promise(resolve => { seloImg.onload = resolve; });

             // --- Add Seal Watermark ---
            const seloWidth = 180; // Increased size for PDF
            const seloHeight = (seloImg.height * seloWidth) / seloImg.width;
            const seloX = (pageWidth - seloWidth) / 2;
            const seloY = (pageHeight - seloHeight) / 2; // Center it
            doc.setGState(new (doc as any).GState({ opacity: 0.04 })); // Lighter
            doc.addImage(seloImg, 'PNG', seloX, seloY, seloWidth, seloHeight);
            doc.setGState(new (doc as any).GState({ opacity: 1 }));


            // --- PDF Header ---
            const logoWidth = 30; 
            const logoHeight = (logoImg.height * logoWidth) / logoImg.width; 
            const headerY = 20;

            doc.addImage(logoImg, 'PNG', margin, headerY, logoWidth, logoHeight);
            
            doc.setFontSize(16);
            doc.setTextColor(30, 30, 30);
            const reportTitle = t_report('title');
            doc.text(reportTitle, pageWidth - margin, headerY + 8, { align: 'right' });
            
            let finalY = headerY + logoHeight + 15;
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(formData.eventName, pageWidth / 2, finalY, { align: 'center' });
            finalY += 10;

            doc.setDrawColor(220, 220, 220); 
            doc.line(margin, finalY, pageWidth - margin, finalY);
            finalY += 10;

            doc.setFont('helvetica', 'normal');
            
            // --- Introduction Text ---
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
                Math.ceil(item.ucs).toString(),
                formatCurrency(item.cost)
            ]);

            doc.autoTable({
                startY: finalY,
                head: [[t_report('table.participants'), t_report('table.quantity'), t_report('table.duration'), t_report('table.totalUCS'), t_report('table.directCost')]],
                body: tableData,
                theme: 'grid', // Use grid to show borders without solid fill
                headStyles: { 
                  fillColor: [22, 101, 52], 
                  textColor: 255 
                },
                alternateRowStyles: {
                  fillColor: false // No background for alternate rows
                },
                styles: {
                  fillColor: false // No background for regular rows
                },
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

            let totalsItems = [
                [t_report('totals.totalToCompensate'), `${Math.ceil(results.totalUCS)} UCS`],
                [t_report('totals.totalBudgetBRL'), formatCurrency(results.totalCost)],
            ];

            if (results.totalCostUSD) {
                totalsItems.push([t_report('totals.totalBudgetUSD'), formatCurrencyUSD(results.totalCostUSD)]);
            }
            if (results.totalCostEUR) {
                totalsItems.push([t_report('totals.totalBudgetEUR'), formatCurrencyEUR(results.totalCostEUR)]);
            }


            doc.autoTable({
                startY: finalY,
                body: summaryItems,
                theme: 'plain',
                styles: { fontSize: 10, fillColor: false },
                columnStyles: { 
                    0: { cellWidth: 'auto' }, 
                    1: { halign: 'right' } 
                },
                margin: { left: margin }
            });
            
            let lastY = (doc as any).lastAutoTable.finalY;

             doc.autoTable({
                startY: lastY,
                body: totalsItems,
                theme: 'plain',
                styles: { fontSize: 12, fontStyle: 'bold', fillColor: false },
                columnStyles: { 
                    0: { cellWidth: 'auto', fontStyle: 'bold' }, 
                    1: { halign: 'right', fontStyle: 'bold' } 
                },
                margin: { left: margin, right: margin }
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
            const summaryData: { Item: string; Value: string | number | undefined }[] = [
                { Item: t('excel.eventName'), Value: formData.eventName },
                { Item: t('excel.totalUCSToCompensate'), Value: results.totalUCS },
                { Item: t('excel.totalDirectCost'), Value: results.directCost },
                { Item: t('excel.totalIndirectCost'), Value: results.indirectCost },
                { Item: t('excel.totalBudgetBRL'), Value: results.totalCost },
            ];

            if (results.totalCostUSD) {
                summaryData.push({ Item: t('excel.totalBudgetUSD'), Value: results.totalCostUSD });
            }
            if (results.totalCostEUR) {
                summaryData.push({ Item: t('excel.totalBudgetEUR'), Value: results.totalCostEUR });
            }

            summaryData.push(
                { Item: t_report('totals.costPerParticipantDay'), Value: results.costPerParticipantDay },
                { Item: t_report('totals.costPerParticipantHour'), Value: results.costPerParticipantHour },
            );

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
            // Set column widths
            const colWidths = [ {wch:30}, {wch:10}, {wch:15}, {wch:15}, {wch:15} ];
            wsDetails['!cols'] = colWidths;

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
                    <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-100" disabled={isExporting}>
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
                    <DropdownMenuItem onClick={handleExcelExport} disabled={isExporting}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        {t('toExcel')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

    