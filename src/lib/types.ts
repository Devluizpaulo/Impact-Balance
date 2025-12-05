
import { z } from 'zod';

type FormTranslations = {
  'formValidation.eventNameError': string;
  'formValidation.participantCountError': string;
  'formValidation.participantDaysError': string;
  'formValidation.visitorCountError': string;
  'formValidation.visitorHoursError': string;
  'formValidation.visitorDaysError': string;
};

// --- Client / Agenda ---
export const clientSchema = z.object({
  accountType: z.enum(['pf', 'pj']),
  documentType: z.string(),
  documentNumber: z.string().min(1, "Campo obrigatório"),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().min(1, "Celular é obrigatório"),
  email: z.string().email("E-mail inválido"),
  
  // Endereço
  cep: z.string().min(1, "CEP é obrigatório"),
  country: z.string().default('Brasil'),
  state: z.string().min(1, "Estado é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  street: z.string().min(1, "Rua é obrigatória"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),

  // Dados Bancários
  bank: z.string().optional(),
  accountTypeBank: z.string().optional(),
  agency: z.string().optional(),
  accountNumber: z.string().optional(),
});

export type ClientData = z.infer<typeof clientSchema>;


// --- Event / Calculator ---
const participantDetailSchema = z.object({
  count: z.coerce.number().min(0, { message: 'formValidation.participantCountError'}).optional(),
  days: z.coerce.number().min(0, { message: 'formValidation.participantDaysError'}).optional(),
});

export type ParticipantDetail = z.infer<typeof participantDetailSchema>;

const participantSchema = z.object({
  organizers: participantDetailSchema.optional(),
  assemblers: participantDetailSchema.optional(),
  suppliers: participantDetailSchema.optional(),
  exhibitors: participantDetailSchema.optional(),
  supportTeam: participantDetailSchema.optional(),
  attendants: participantDetailSchema.optional(),
  support: participantDetailSchema.optional(),
});

export type ParticipantData = z.infer<typeof participantSchema>;

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

export const renewalStatusSchema = z.enum(['pending', 'contacted', 'renewed', 'archived']);
export type RenewalStatus = z.infer<typeof renewalStatusSchema>;


export const formSchema = (t: (key: keyof FormTranslations) => string) => z.object({
  eventName: z.string().min(3, { message: t('formValidation.eventNameError') }),
  participants: participantSchema,
  visitors: visitorsSchema.optional(),
  indirectCosts: indirectCostsSchema.optional(),
  // Fields for legacy seals / renewal
  clientName: z.string().optional(),
  contactName: z.string().optional(),
  parcProg: z.string().optional(),
  uf: z.string().optional(),
  taxa: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
  telefone: z.string().optional(),
  renewalNotes: z.string().optional(),
  renewalStatus: renewalStatusSchema.optional(),
});

export type FormData = z.infer<ReturnType<typeof formSchema>>;

export type Benefits = {
  preservedNativeForestArea: number;
  carbonEmissionAvoided: number;
  storedWood: number;
  faunaSpeciesPreservation: number;
  floraSpeciesPreservation: number;
  hydrologicalFlowPreservation: number;
}

export type CalculationResult = {
  totalParticipants: number;
  totalUCS: number;
  totalCost: number;
  totalCostUSD: number;
  totalCostEUR: number;
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
  benefits: Benefits;
};

// Represents a stored event record
export interface EventRecord {
  id: string;
  timestamp: number;
  formData: FormData;
  results: CalculationResult;
  archived?: boolean;
}

export type NewEventRecord = Omit<EventRecord, 'id' | 'timestamp'>;

    