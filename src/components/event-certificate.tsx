
"use client";

import type { EventRecord } from "@/lib/types";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Separator } from "./ui/separator";

interface EventCertificateProps {
    event: EventRecord;
}

export default function EventCertificate({ event }: EventCertificateProps) {
    const t = useTranslations("EventCertificate");
    const { formData, results, timestamp, id } = event;
    const { benefits } = results;

    const formatDate = (date: number | Date) => new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

    const benefitItems = [
        { label: t('benefits.preservedNativeForestArea'), value: benefits?.preservedNativeForestArea, unit: 'm²' },
        { label: t('benefits.carbonEmissionAvoided'), value: benefits?.carbonEmissionAvoided, unit: 'tCO₂e' },
        { label: t('benefits.storedWood'), value: benefits?.storedWood, unit: 'm³' },
        { label: t('benefits.faunaSpeciesPreservation'), value: benefits?.faunaSpeciesPreservation, unit: t('benefits.speciesUnit') },
        { label: t('benefits.floraSpeciesPreservation'), value: benefits?.floraSpeciesPreservation, unit: t('benefits.speciesUnit') },
        { label: t('benefits.hydrologicalFlowPreservation'), value: benefits?.hydrologicalFlowPreservation, unit: 'L/Ano' },
    ];
    
    const formatNumber = (value: number | undefined) => {
        if (value === undefined) return '-';
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
    }

    return (
        <div id="event-certificate" className="bg-white text-gray-800 aspect-[1/1.414] w-full max-w-full mx-auto p-4 sm:p-6 shadow-2xl relative flex flex-col font-serif">
            {/* Wavy lines background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="wavy-lines" patternUnits="userSpaceOnUse" width="100" height="20">
                           <path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="hsl(var(--primary) / 0.1)" fill="none" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#wavy-lines)"/>
                </svg>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <Image 
                    src="/logo.png" 
                    alt={t('watermarkAlt')}
                    width={400}
                    height={400}
                    className="opacity-[0.03] scale-125"
                />
            </div>

            {/* Decorative Border */}
            <div className="absolute inset-0 border-[6px] border-primary/80 m-1 z-10 pointer-events-none rounded-sm"></div>
            <div className="absolute inset-0 border-2 border-primary/50 m-3 z-10 pointer-events-none rounded-sm"></div>

            <div className="relative z-20 flex-grow flex flex-col p-4 sm:p-8">
                {/* Header */}
                <header className="text-center mb-6">
                    <div className="flex justify-center items-center gap-4">
                        <Image src="/logo-tesouro-verde.png" alt="Tesouro Verde Logo" width={140} height={70} className="object-contain" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary mt-4 font-headline tracking-tight">
                        {t('title')}
                    </h1>
                </header>

                {/* Main Content */}
                <main className="flex-grow text-center space-y-4">
                    <p className="text-lg sm:text-xl leading-relaxed">
                        {t('certificationStatement')}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 pt-2 tracking-wide">
                        {formData.eventName}
                    </h2>
                    <div className="text-base sm:text-lg text-gray-600">
                        <p><strong>{t('acquiredQuantity')}:</strong> {results.totalUCS} {t('ucsUnit')}</p>
                        <p><strong>{t('operationDate')}:</strong> {formatDate(timestamp)}</p>
                    </div>

                     <p className="text-sm italic max-w-2xl mx-auto pt-4 text-gray-500">
                        {t('productDescription')}
                    </p>
                </main>

                 {/* Benefits Section */}
                <section className="mt-6 border-t-2 border-gray-200 pt-4">
                    <h3 className="font-bold text-xl text-center mb-4 text-primary font-headline">{t('benefits.title')}</h3>
                    <p className="text-xs text-gray-500 text-center mb-4">{t('benefits.intro')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                        {benefitItems.map(item => (
                             <div key={item.label} className="flex items-start">
                                <span className="text-primary mr-2 text-base">✓</span>
                                <div>
                                    <span className="font-semibold">{item.label}:</span>
                                    <p className="text-gray-600">{formatNumber(item.value)} {item.unit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                {/* Footer */}
                <footer className="mt-auto pt-6 text-xs text-center text-gray-500 space-y-2">
                    <Separator className="bg-gray-300" />
                     <div className="flex justify-between items-center pt-2">
                        <div className="text-left">
                            <strong>{t('verification.title')}:</strong>
                            <p className="break-all font-mono text-[10px]">{id}</p>
                        </div>
                        <div className="flex items-center gap-4">
                             <Image src="/logo-bmtca.png" alt="BMTCA Logo" width={80} height={27} className="object-contain" />
                             <Image src="/logo-bmv.png" alt="BMV Logo" width={80} height={27} className="object-contain" />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
