import { z } from 'zod';

type FormTranslations = {
  'formValidation.eventNameError': string;
  'formValidation.durationHoursError': string;
  'formValidation.durationDaysError': string;
};

const participantSchema = z.object({
  organizers: z.coerce.number().min(0).optional(),
  assemblers: z.coerce.number().min(0).optional(),
  suppliers: z.coerce.number().min(0).optional(),
  exhibitors: z.coerce.number().min(0).optional(),
  supportTeam: z.coerce.number().min(0).optional(),
  attendants: z.coerce.number().min(0).optional(),
  support: z.coerce.number().min(0).optional(),
  visitors: z.coerce.number().min(0).optional(),
});

export const formSchema = (t: (key: keyof FormTranslations) => string) => z.object({
  eventName: z.string().min(3, { message: t('formValidation.eventNameError') }),
  participants: participantSchema,
  durationHours: z.coerce.number().min(1, { message: t('formValidation.durationHoursError') }),
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
