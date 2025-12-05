

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
export const clientStatusSchema = z.enum(['Ativo', 'Inativo', 'Pendente']);
export type ClientStatus = z.infer<typeof clientStatusSchema>;

export const clientProfileSchema = z.enum([
    'Administrador', 'Usuário AKSES', 'Cliente', 'IMEI', 'Associação', 
    'Produtor', 'Governo', 'Parceiro', 'Distribuidor Geral', 
    'Distribuidor Financeiro', 'Distribuidor Credenciado', 'Jurídico', 
    'Diretor', 'Supervisor', 'Operador GEO', 'Administrativo', 'TI', 
    'Auditoria', 'Financeiro'
]);
export type ClientProfile = z.infer<typeof clientProfileSchema>;


export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  firstName: z.string().min(1, "O nome é obrigatório"),
  lastName: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  mobile: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.any().optional(),
  status: clientStatusSchema.default('Ativo'),
  
  accountType: z.enum(['pf', 'pj']),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  
  // Endereço
  addressType: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Brasil'),

  stateRegistration: z.string().optional(),

  // Perfis
  profiles: z.array(clientProfileSchema).optional(),

  // Dados Bancários
  bank: z.string().optional(),
  accountTypeBank: z.string().optional(),
  agency: z.string().optional(),
  accountNumber: z.string().optional(),
}).transform(data => ({
    ...data,
    name: `${data.firstName} ${data.lastName || ''}`.trim()
}));


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

