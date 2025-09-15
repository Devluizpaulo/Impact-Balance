import { z } from 'zod';

type FormTranslations = {
  eventNameError: string;
  participantsError: string;
  durationDaysError: string;
};

export const formSchema = (t: (key: keyof FormTranslations) => string) => z.object({
  eventName: z.string().min(3, { message: t('eventNameError') }),
  participants: z.coerce.number().min(1, { message: t('participantsError') }),
  durationDays: z.coerce.number().min(1, { message: t('durationDaysError') }),
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
