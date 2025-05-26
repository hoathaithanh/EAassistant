// src/ai/flows/expand-audit-report.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for expanding sections of an energy audit report using GenAI.
 *
 * - expandAuditReport - A function that expands the given text by adding relevant details and suggestions.
 * - ExpandAuditReportInput - The input type for the expandAuditReport function.
 * - ExpandAuditReportOutput - The return type for the expandAuditReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandAuditReportInputSchema = z.object({
  text: z.string().describe('The text from the energy audit report to expand.'),
});
export type ExpandAuditReportInput = z.infer<typeof ExpandAuditReportInputSchema>;

const ExpandAuditReportOutputSchema = z.object({
  expandedText: z.string().describe('The expanded text with added details and suggestions.'),
});
export type ExpandAuditReportOutput = z.infer<typeof ExpandAuditReportOutputSchema>;

export async function expandAuditReport(input: ExpandAuditReportInput): Promise<ExpandAuditReportOutput> {
  return expandAuditReportFlow(input);
}

const expandAuditReportPrompt = ai.definePrompt({
  name: 'expandAuditReportPrompt',
  input: {schema: ExpandAuditReportInputSchema},
  output: {schema: ExpandAuditReportOutputSchema},
  prompt: `You are a senior energy consultant with extensive experience in practical energy-saving solutions.
  Expand the following section of an energy audit report by adding relevant details, suggestions, and context based on your expertise.

  Original Text: {{{text}}}

  Expanded Text:`, // The LLM will expand upon the original text.
});

const expandAuditReportFlow = ai.defineFlow(
  {
    name: 'expandAuditReportFlow',
    inputSchema: ExpandAuditReportInputSchema,
    outputSchema: ExpandAuditReportOutputSchema,
  },
  async input => {
    const {output} = await expandAuditReportPrompt(input);
    return output!;
  }
);
