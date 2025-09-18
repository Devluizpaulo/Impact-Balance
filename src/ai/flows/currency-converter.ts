'use server';
/**
 * @fileOverview A flow to get simulated currency exchange rates.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CurrencyRatesOutputSchema = z.object({
  rates: z.record(z.number()).describe('A map of currency codes to their exchange rate against the base currency (BRL).'),
});
export type CurrencyRatesOutput = z.infer<typeof CurrencyRatesOutputSchema>;

export async function getCurrencyRates(): Promise<CurrencyRatesOutput> {
  return currencyConverterFlow();
}

const currencyConverterFlow = ai.defineFlow(
  {
    name: 'currencyConverterFlow',
    inputSchema: z.void(),
    outputSchema: CurrencyRatesOutputSchema,
  },
  async () => {
    // In a real application, this would call an external API.
    // For this prototype, we're returning simulated static rates.
    // Rates as of late 2024 for BRL to USD/EUR.
    const simulatedRates = {
      'USD': 0.18, // 1 BRL = 0.18 USD
      'EUR': 0.16, // 1 BRL = 0.16 EUR
    };
    
    return { rates: simulatedRates };
  }
);
