
"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Share2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EventRecord } from '@/lib/types';

interface CertificateActionsProps {
  event: EventRecord;
}

export default function CertificateActions({ event }: CertificateActionsProps) {
  const t = useTranslations('EventSealPage.actions');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { formData } = event;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const certificateElement = document.getElementById('event-certificate');
      if (!certificateElement) {
        throw new Error('Certificate element not found');
      }

      // Use html2canvas to render the component to a canvas
      const canvas = await html2canvas(certificateElement, {
        scale: 2, // Increase resolution for better quality
        useCORS: true, 
        backgroundColor: null // Use transparent background
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions to maintain A4 aspect ratio
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Use the aspect ratio of the canvas to fit it into the PDF
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;

      let finalWidth, finalHeight;
      if (canvasAspectRatio > pdfAspectRatio) {
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / canvasAspectRatio;
      } else {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * canvasAspectRatio;
      }

      // Center the image on the PDF page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      const fileName = `Certificado-${formData.eventName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Não foi possível baixar o certificado. Tente novamente.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(t('whatsappMessage', { eventName: formData.eventName }));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex gap-2 justify-center p-4 bg-gray-300 rounded-md">
      <Button onClick={handleDownload} disabled={isGenerating}>
        {isGenerating ? <Loader2 className="animate-spin" /> : <Download />}
        {isGenerating ? t('generating') : t('download')}
      </Button>
      <Button variant="outline" onClick={handleWhatsApp}>
        <Share2 /> {t('whatsapp')}
      </Button>
    </div>
  );
}
