import { z } from 'zod';

type FormTranslations = {
  'formValidation.eventNameError': string;
  'formValidation.participantCountError': string;
  'formValidation.participantDaysError': string;
  'formValidation.visitorCountError': string;
  'formValidation.visitorHoursError': string;
  'formValidation.visitorDaysError': string;
};

const participantDetailSchema = z.object({
  count: z.coerce.number().min(0, { message: 'formValidation.participantCountError'}).optional(),
  days: z.coerce.number().min(0, { message: 'formValidation.participantDaysError'}).optional(),
});

const participantSchema = z.object({
  organizers: participantDetailSchema.optional(),
  assemblers: participantDetailSchema.optional(),
  suppliers: participantDetailSchema.optional(),
  exhibitors: participantDetailSchema.optional(),
  supportTeam: participantDetailSchema.optional(),
  attendants: participantDetailSchema.optional(),
  support: participantDetailSchema.optional(),
});

const visitorsSchema = z.object({
    count: z.coerce.number().min(0, { message: 'formValidation.visitorCountError'}).optional(),
    unit: z.enum(['hours', 'days']),
    hours: z.coerce.number().min(0, { message: 'formValidation.visitorHoursError'}).optional(),
    days: z.coerce.number().min(0, { message: 'formValidation.visitorDaysError'}).optional(),
});

const indirectCostsSchema = z.object({
  ownershipRegistration: z.coerce.number().min(0).optional(),
  certificateIssuance: z.coerce.number().min(0).optional(),
  websitePage: z.coerce.number().min(0).optional(),
});

export const formSchema = (t: (key: keyof FormTranslations) => string) => z.object({
  eventName: z.string().min(3, { message: t('formValidation.eventNameError') }),
  participants: participantSchema,
  visitors: visitorsSchema.optional(),
  indirectCosts: indirectCostsSchema.optional(),
});

export type FormData = z.infer<ReturnType<typeof formSchema>>;

export type CalculationResult = {
  totalUCS: number;
  totalCost: number;
  totalCostUSD?: number;
  totalCostEUR?: number;
  directUcs: number;
  directCost: number;
  indirectCost: number; // Indirect costs are purely monetary
  ucsPerParticipant: number;
  costPerParticipant: number;
  costPerParticipantDay: number;
  costPerParticipantHour: number;
  breakdown: {
    category: string;
    ucs: number;
    cost: number;
    quantity: number;
    duration: number;
    durationUnit: 'days' | 'hours';
  }[];
  indirectBreakdown: {
    category: string;
    cost: number;
  }[];
  equivalences: {
    dailyUCS: number;
    hourlyUCS: number;
    gdpPercentage: number;
  };
};

// Represents a stored event record
export interface EventRecord {
  id: string;
  timestamp: number;
  formData: FormData;
  results: CalculationResult;
}
