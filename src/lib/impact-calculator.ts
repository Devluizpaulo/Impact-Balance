

"use client";

import { type FormData, type CalculationResult, type Benefits } from "@/lib/types";
import { defaultSettings } from "@/lib/settings";
import { addEvent } from "@/lib/event-storage";


// Helper function to recursively replace undefined with null
// Firestore doesn't support `undefined` values.
const cleanupUndefined = (obj: unknown): unknown => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map((item) => cleanupUndefined(item));
  if (typeof obj === 'object') {
    const source = obj as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        out[key] = cleanupUndefined(source[key]);
      }
    }
    return out;
  }
  return obj;
};


export async function calculateImpact(values: FormData, settings: typeof defaultSettings) {
    const { calculation } = settings;
    const { participants, visitors } = values;

    const breakdown: { category: string; ucs: number; cost: number, quantity: number, duration: number, durationUnit: 'days' | 'hours' }[] = [];
    let totalParticipantsValue = 0;
    const quotationValue = calculation.equivalences.useManualQuotation 
      ? calculation.equivalences.manualQuotationValue
      : calculation.equivalences.ucsQuotationValue > 0
      ? calculation.equivalences.ucsQuotationValue
      : defaultSettings.calculation.equivalences.ucsQuotationValue;
    
    // Calculate staff UCS (by days)
    Object.entries(participants).forEach(([key, p]) => {
      const participantData = p as { count?: number; days?: number };
      const count = participantData.count || 0;
      const days = participantData.days || 0;

      if (count > 0 && days > 0) {
        totalParticipantsValue += count;
        const rawUcs = count * days * calculation.perCapitaFactors.dailyUcsConsumption;
        const ucs = Math.ceil(rawUcs);
        
        breakdown.push({
          category: key,
          ucs: ucs, 
          cost: ucs * quotationValue,
          quantity: count,
          duration: days,
          durationUnit: 'days',
        });
      }
    });

    // Calculate visitor UCS (by hours or days)
    const visitorCount = visitors?.count || 0;
    if (visitorCount > 0 && visitors) {
        totalParticipantsValue += visitorCount;
        let ucs = 0;
        let duration = 0;
        let durationUnit: 'days' | 'hours' = 'hours';

        if (visitors.unit === 'days') {
            duration = visitors.days || 0;
            durationUnit = 'days';
            if (duration > 0) {
                const rawUcs = visitorCount * duration * calculation.perCapitaFactors.dailyUcsConsumption;
                ucs = Math.ceil(rawUcs);
            }
        } else { // hours
            duration = visitors.hours || 0;
            durationUnit = 'hours';
            if (duration > 0) {
                 const personHours = visitorCount * duration;
                 ucs = Math.ceil(personHours / 14);
            }
        }
        
        if (ucs > 0) {
            breakdown.push({
                category: 'visitors',
                ucs: ucs,
                cost: ucs * quotationValue,
                quantity: visitorCount,
                duration: duration,
                durationUnit: durationUnit,
            });
        }
    }
    
    const directUcs = breakdown.reduce((acc, item) => acc + item.ucs, 0);
    const directCost = breakdown.reduce((acc, item) => acc + item.cost, 0);
    
    // Calculate indirect costs
    const indirectBreakdown: { category: string; cost: number }[] = [];
    const ownershipRegistrationCost = directCost * (calculation.indirectCosts.ownershipRegistration / 100);
    
    indirectBreakdown.push({ category: "ownershipRegistration", cost: ownershipRegistrationCost });
    indirectBreakdown.push({ category: "certificateIssuance", cost: calculation.indirectCosts.certificateIssuance });
    indirectBreakdown.push({ category: "websitePage", cost: calculation.indirectCosts.websitePage });
    
    const indirectCost = indirectBreakdown.reduce((acc, item) => acc + item.cost, 0);
    
    const totalCost = directCost + indirectCost;
    const totalUCS = directUcs;
    
    // Calculate total participant duration for averages
    let totalParticipantDays = 0;
    let totalParticipantHours = 0;

    Object.entries(participants).forEach(([, p]) => {
      const data = p as { count?: number; days?: number };
      if (data.count && data.days) {
        totalParticipantDays += data.count * data.days;
        totalParticipantHours += data.count * data.days * 8; // Assuming 8-hour day
      }
    });

    if (visitors && visitors.count) {
      if (visitors.unit === 'days' && visitors.days) {
        totalParticipantDays += visitors.count * visitors.days;
        totalParticipantHours += visitors.count * visitors.days * 8;
      } else if (visitors.unit === 'hours' && visitors.hours) {
        totalParticipantHours += visitors.count * visitors.hours;
        totalParticipantDays += (visitors.count * visitors.hours) / 8;
      }
    }


    // Calculate benefits based on total UCS
    const benefits: Benefits = {
        preservedNativeForestArea: totalUCS * calculation.benefits.preservedNativeForestArea,
        carbonEmissionAvoided: totalUCS * calculation.benefits.carbonEmissionAvoided,
        storedWood: totalUCS * calculation.benefits.storedWood,
        faunaSpeciesPreservation: totalUCS * calculation.benefits.faunaSpeciesPreservation,
        floraSpeciesPreservation: totalUCS * calculation.benefits.floraSpeciesPreservation,
        hydrologicalFlowPreservation: totalUCS * calculation.benefits.hydrologicalFlowPreservation,
    };

    const maxDays = Math.max(
      ...Object.values(participants).map(p => (p as {days?: number})?.days || 0),
      (visitors?.unit === 'days' ? (visitors.days || 0) : (visitors?.hours || 0) / 8)
    );
    const totalEventHours = maxDays > 0 ? maxDays * 24 : 0;
    
    const results: CalculationResult = {
      totalParticipants: totalParticipantsValue,
      totalUCS,
      totalCost,
      totalCostUSD: totalUCS * (settings.calculation.equivalences.ucsQuotationValueUSD || 0),
      totalCostEUR: totalUCS * (settings.calculation.equivalences.ucsQuotationValueEUR || 0),
      directUcs,
      directCost,
      indirectCost,
      ucsPerParticipant: totalParticipantsValue > 0 ? totalUCS / totalParticipantsValue : 0,
      costPerParticipant: totalParticipantsValue > 0 ? totalCost / totalParticipantsValue : 0,
      costPerParticipantDay: totalParticipantDays > 0 ? totalCost / totalParticipantDays : 0,
      costPerParticipantHour: totalParticipantHours > 0 ? totalCost / totalParticipantHours : 0,
      breakdown,
      indirectBreakdown,
      equivalences: {
        dailyUCS: maxDays > 0 ? totalUCS / maxDays : 0,
        hourlyUCS: totalEventHours > 0 ? totalUCS / totalEventHours : 0,
        gdpPercentage: calculation.equivalences.gdpPerCapita > 0 ? (totalCost / calculation.equivalences.gdpPerCapita) * 100 : 0,
      },
      benefits,
    };

    const cleanedValues = cleanupUndefined(values) as FormData;

    await addEvent({
      formData: cleanedValues,
      results
    });

    return { results, cleanedValues };
  }

    

