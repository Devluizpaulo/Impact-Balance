
"use client";

import type { EventRecord } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface EventCertificateProps {
    event: EventRecord;
}

export default function EventCertificate({ event }: EventCertificateProps) {
    const t = useTranslations("EventCertificate");
    const { formData, results, timestamp, id } = event;
    const { benefits } = results;

    const formatDate = (date: number | Date) => new Date(date).toLocaleDateString('pt-BR');

    const benefitItems = [
        { label: t('benefits.preservedNativeForestArea'), value: benefits?.preservedNativeForestArea, unit: 'm²' },
        { label: t('benefits.carbonEmissionAvoided'), value: benefits?.carbonEmissionAvoided, unit: 'tCO2e' },
        { label: t('benefits.storedWood'), value: benefits?.storedWood, unit: 'm³' },
        { label: t('benefits.faunaSpeciesPreservation'), value: benefits?.faunaSpeciesPreservation, unit: '' },
        { label: t('benefits.floraSpeciesPreservation'), value: benefits?.floraSpeciesPreservation, unit: '' },
        { label: t('benefits.hydrologicalFlowPreservation'), value: benefits?.hydrologicalFlowPreservation, unit: 'L/Ano' },
    ];
    
    const formatNumber = (value: number | undefined) => {
        if (value === undefined) return '-';
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
    }

    return (
        <div id="event-certificate" className="bg-white text-gray-800 p-4 sm:p-6 rounded-lg font-sans">
             <div className="grid grid-cols-12 gap-6 relative">
                {/* Background watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Image 
                        src="/selo-watermark.png" 
                        alt="Selo de Certificação"
                        layout="fill"
                        objectFit="contain"
                        objectPosition="center"
                        className="opacity-5"
                    />
                </div>
                
                {/* Main Content */}
                <div className="col-span-12 md:col-span-8 space-y-4 z-10">
                    <h2 className="text-2xl font-bold text-primary border-b-2 border-primary/50 pb-2">
                        {t('title')}
                    </h2>
                    
                    <div className="text-sm space-y-1">
                        <p><strong>{t('holder')}:</strong> {formData.eventName}</p>
                        <p><strong>{t('operationDate')}:</strong> {formatDate(timestamp)}</p>
                        <p><strong>{t('product')}:</strong> {t('productName')}</p>
                        <p><strong>{t('acquiredQuantity')}:</strong> {results.totalUCS} {t('ucsUnit')}</p>
                    </div>

                    <p className="text-xs italic py-4">
                        {t('certificationStatement')}
                    </p>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-lg mb-2">{t('benefits.title')}</h3>
                        <p className="text-xs text-gray-600 mb-4">{t('benefits.intro')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            {benefitItems.map(item => (
                                <div key={item.label}>
                                    <strong>{item.label}:</strong> {formatNumber(item.value)} {item.unit}
                                </div>
                            ))}
                        </div>
                    </div>

                     <div className="border-t pt-4 mt-4">
                        <h3 className="font-bold text-lg mb-2">{t('verification.title')}</h3>
                        <p className="text-xs break-all"><strong>{t('verification.registrationNumber')}:</strong> {id}</p>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-between space-y-6 bg-gray-50 p-4 rounded-lg z-10">
                    <Image src="/logo-tesouro-verde.png" alt="Tesouro Verde Logo" width={150} height={75} />
                    <Image src="/logo-bmtca.png" alt="BMTCA Logo" width={150} height={50} />
                    <Image src="/logo-bmv.png" alt="BMV Logo" width={150} height={50} />
                    <Image src="/selo.png" alt="Selo" width={120} height={120} />
                </div>
            </div>
        </div>
    );
}
