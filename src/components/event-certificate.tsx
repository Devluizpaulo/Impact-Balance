
"use client";

import type { EventRecord } from "@/lib/types";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { MapPin } from "lucide-react";
import DonutChart from "./donut-chart";

interface EventCertificateProps {
    event: EventRecord;
}

const BenefitItem = ({ label, value, unit, imageUrl }: { label: string, value: string | number, unit: string, imageUrl: string }) => (
    <div className="bg-gray-100/80 rounded-lg p-2 flex items-center gap-2 text-xs">
        <Image src={imageUrl} alt={label} width={32} height={32} className="rounded-md object-cover w-8 h-8" />
        <div className="flex-1">
            <p className="font-bold text-gray-800">{label}</p>
            <p className="text-gray-600 font-mono">{value} <span className="text-xs">{unit}</span></p>
        </div>
    </div>
);

const NucleoItem = ({ name }: { name: string }) => (
    <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold">{name}</span>
    </div>
);

const OdsIcon = ({ src, alt }: { src: string, alt: string }) => (
    <Image src={src} alt={alt} width={40} height={40} className="w-auto h-auto" />
);


export default function EventCertificate({ event }: EventCertificateProps) {
    const t = useTranslations("EventCertificate");
    const { formData, results, timestamp, id } = event;
    const { benefits } = results;

    const formatDate = (date: number | Date) => new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    const formatBenefitValue = (value: number | undefined) => {
        if (value === undefined) return '-';
        if (value >= 1000) return (value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
        return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    };

    const benefitItems = [
        { label: t('benefitsGrid.forest'), value: formatBenefitValue(benefits.preservedNativeForestArea), unit: 'm²', imageUrl: '/benefit-icons/floresta.png' },
        { label: t('benefitsGrid.carbon'), value: formatBenefitValue(benefits.carbonEmissionAvoided), unit: 'tCO₂e', imageUrl: '/benefit-icons/carbono.png' },
        { label: t('benefitsGrid.fauna'), value: formatBenefitValue(benefits.faunaSpeciesPreservation), unit: 'spp/ha', imageUrl: '/benefit-icons/fauna.png' },
        { label: t('benefitsGrid.flora'), value: formatBenefitValue(benefits.floraSpeciesPreservation), unit: 'spp/ha', imageUrl: '/benefit-icons/flora.png' },
        { label: t('benefitsGrid.wood'), value: formatBenefitValue(benefits.storedWood), unit: 'm³', imageUrl: '/benefit-icons/madeira.png' },
        { label: t('benefitsGrid.supportedProduction'), value: "N/A", unit: '', imageUrl: '/benefit-icons/producao.png' },
        { label: t('benefitsGrid.hydrological'), value: formatBenefitValue(benefits.hydrologicalFlowPreservation), unit: 'L/Ano', imageUrl: '/benefit-icons/hidrologico.png' },
        { label: t('benefitsGrid.areaRecovery'), value: "N/A", unit: '', imageUrl: '/benefit-icons/recuperacao.png' },
    ];

    const nucleos = [
        "NÚCLEO MADEIRA", "NÚCLEO TELES PIRES", "NÚCLEO MUMBUCA MATA VIVA", 
        "NÚCLEO AMAPÁ MATA VIVA", "NÚCLEO ARINOS", "NÚCLEO XINGU", "NÚCLEO GUARIBA"
    ];

    const odsIconsGroup1 = [
        { src: "/ods-icons/ods-8.png", alt: "ODS 8" }, { src: "/ods-icons/ods-12.png", alt: "ODS 12" },
        { src: "/ods-icons/ods-13.png", alt: "ODS 13" }, { src: "/ods-icons/ods-15.png", alt: "ODS 15" },
        { src: "/ods-icons/ods-17.png", alt: "ODS 17" }
    ];
     const odsIconsGroup2 = [
        { src: "/ods-icons/ods-1.png", alt: "ODS 1" }, { src: "/ods-icons/ods-4.png", alt: "ODS 4" },
        { src: "/ods-icons/ods-6.png", alt: "ODS 6" }, { src: "/ods-icons/ods-10.png", alt: "ODS 10" }
    ];
     const odsIconsGroup3 = [
        { src: "/ods-icons/ods-3.png", alt: "ODS 3" }, { src: "/ods-icons/ods-9.png", alt: "ODS 9" },
        { src: "/ods-icons/ods-11.png", alt: "ODS 11" }
    ];


    return (
        <div id="event-certificate" className="bg-white text-gray-800 aspect-[1/1.414] w-full max-w-full mx-auto shadow-2xl flex flex-col font-sans relative p-4 sm:p-6">
            
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10"
                style={{ backgroundImage: "url('/certificate-bg.png')" }}
            ></div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <header className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <Image src="/logo-bmv.png" alt="BMV Logo" width={100} height={34} />
                    <h1 className="font-bold text-base sm:text-lg text-center">REPORT BMV PERFORMANCE</h1>
                    <div className="flex items-center gap-2">
                        <Image src="/logo-sgs.png" alt="SGS Logo" width={40} height={40} />
                        <span className="font-semibold text-xs sm:text-sm">Nov 2026</span>
                    </div>
                </header>

                <main className="flex-grow grid grid-cols-12 gap-4 pt-4">
                    {/* Left Column */}
                    <div className="col-span-5 space-y-4 flex flex-col">
                        <div className="bg-gray-50/80 p-3 rounded-lg">
                            <p className="text-xs">CPF/CNPJ: <span className="font-bold">N/A</span></p>
                            <p className="text-xs">Data: <span className="font-bold">{formatDate(timestamp)}</span></p>
                            <p className="text-sm font-bold mt-1">ICRS*: <span className="text-primary">{results.totalUCS} UCS</span></p>
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                            <div className="relative">
                                <Image src="/mapa-brasil-folha.png" alt="Mapa do Brasil" width={400} height={400} className="w-full h-auto" />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                                {nucleos.map(name => <NucleoItem key={name} name={name} />)}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-7 space-y-4">
                         <div className="p-3 bg-gray-50/80 rounded-lg text-xs h-24 sm:h-32 overflow-y-auto">
                            {/* Placeholder list */}
                            <p className="font-bold text-gray-700 mb-1">Benefícios Adicionais</p>
                            {Array.from({ length: 12 }).map((_, i) => <p key={i} className="text-gray-500 text-[10px]">Benefício adicional {i+1}</p>)}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {benefitItems.map(item => <BenefitItem key={item.label} {...item} />)}
                        </div>
                        <Separator />
                        <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                             <div className="col-span-1 flex items-center justify-center -rotate-90">
                                <p className="font-bold text-lg text-gray-400 tracking-widest whitespace-nowrap">ODS</p>
                            </div>
                            <div className="col-span-6 space-y-2">
                                <div className="flex flex-wrap gap-1">
                                    {odsIconsGroup1.map(icon => <OdsIcon key={icon.src} {...icon} />)}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {odsIconsGroup2.map(icon => <OdsIcon key={icon.src} {...icon} />)}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {odsIconsGroup3.map(icon => <OdsIcon key={icon.src} {...icon} />)}
                                </div>
                            </div>
                            <div className="col-span-5 flex items-center justify-around gap-2">
                                <DonutChart value={75} label="2030" />
                                <DonutChart value={30} label="30%" />
                            </div>
                        </div>
                        <p className="text-[8px] text-gray-400 text-center">
                            Fonte: https://www.cbd.int/article/cop15-cbd-press-release-final-19dec2022
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 pt-2 border-t border-gray-200 mt-auto">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <p className="truncate w-1/3">{id}</p>
                        <p className="truncate w-1/3 text-center">{formData.eventName}</p>
                        <div className="w-1/3" />
                    </div>
                </footer>
            </div>
        </div>
    );
}
