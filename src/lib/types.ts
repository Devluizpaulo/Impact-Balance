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
  count: z.coerce.number().min(0, { message: 'formValidation.participantCountError'}),
  days: z.coerce.number().min(0, { message: 'formValidation.participantDaysError'}),
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
    count: z.coerce.number().min(0, { message: 'formValidation.visitorCountError'}),
    unit: z.enum(['hours', 'days']),
    hours: z.coerce.number().min(0, { message: 'formValidation.visitorHoursError'}),
    days: z.coerce.number().min(0, { message: 'formValidation.visitorDaysError'}),
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
