// A flow to get AI-powered suggestions on how to reduce the environmental footprint of an event.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImpactSuggestionsInputSchema = z.object({
  eventData: z
    .string()
    .describe(
      'A detailed description of the event, including participant numbers, duration, activities, and any other relevant information that could impact the environment.'
    ),
  currentPractices: z
    .string()
    .describe(
      'A description of the current sustainability practices in place for the event.'
    ),
});
export type ImpactSuggestionsInput = z.infer<typeof ImpactSuggestionsInputSchema>;

const ImpactSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of actionable suggestions to reduce the environmental footprint of the event, based on the provided data and current practices.'
    ),
});
export type ImpactSuggestionsOutput = z.infer<typeof ImpactSuggestionsOutputSchema>;

export async function getImpactSuggestions(
  input: ImpactSuggestionsInput
): Promise<ImpactSuggestionsOutput> {
  return impactSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'impactSuggestionsPrompt',
  input: {schema: ImpactSuggestionsInputSchema},
  output: {schema: ImpactSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide suggestions for reducing the environmental footprint of events.

You will be given a description of the event and the current sustainability practices in place.
Based on this information, you will provide a list of actionable suggestions to reduce the environmental impact.

Event Description: {{{eventData}}}
Current Practices: {{{currentPractices}}}

Suggestions:`,
});

const impactSuggestionsFlow = ai.defineFlow(
  {
    name: 'impactSuggestionsFlow',
    inputSchema: ImpactSuggestionsInputSchema,
    outputSchema: ImpactSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
