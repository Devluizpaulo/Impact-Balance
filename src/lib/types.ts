import { z } from 'zod';

type FormTranslations = {
  'formValidation.eventNameError': string;
  'formValidation.participantsError': string;
  'formValidation.durationDaysError': string;
};

export const formSchema = (t: (key: keyof FormTranslations) => string) => z.object({
  eventName: z.string().min(3, { message: t('formValidation.eventNameError') }),
  participants: z.coerce.number().min(1, { message: t('formValidation.participantsError') }),
  durationDays: z.coerce.number().min(1, { message: t('formValidation.durationDaysError') }),
  venueSizeSqm: z.coerce.number().optional(),
  travelKm: z.coerce.number().optional(),
  wasteKg: z.coerce.number().optional(),
  waterLiters: z.coerce.number().optional(),
  energyKwh: z.coerce.number().optional(),
  currentPractices: z.string().optional(),
});

export type FormData = z.infer<ReturnType<typeof formSchema>>;

export type CalculationResult = {
  totalUCS: number;
  totalCost: number;
  ucsPerParticipant: number;
  costPerParticipant: number;
  breakdown: {
    category: string;
    ucs: number;
    cost: number;
  }[];
  equivalences: {
    dailyUCS: number;
    hourlyUCS: number;
    gdpPercentage: number;
  };
};
