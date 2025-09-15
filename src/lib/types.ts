import { z } from 'zod';

export const formSchema = z.object({
  eventName: z.string().min(3, { message: "Event name must be at least 3 characters." }),
  participants: z.coerce.number().min(1, { message: "At least 1 participant is required." }),
  durationDays: z.coerce.number().min(1, { message: "Duration must be at least 1 day." }),
  venueSizeSqm: z.coerce.number().optional(),
  travelKm: z.coerce.number().optional(),
  wasteKg: z.coerce.number().optional(),
  waterLiters: z.coerce.number().optional(),
  energyKwh: z.coerce.number().optional(),
  currentPractices: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

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
