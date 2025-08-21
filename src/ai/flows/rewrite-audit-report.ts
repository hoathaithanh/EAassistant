
'use server';
/**
 * @fileOverview This file contains the Genkit flow for rewriting audit reports.
 *
 * - rewriteAuditReport - A function that rewrites sections of an energy audit report using GenAI.
 * - RewriteAuditReportInput - The input type for the rewriteAuditReport function.
 * - RewriteAuditReportOutput - The return type for the rewriteAuditReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ModelParametersSchema } from '@/ai/schemas/model-parameters-schema';

const RewriteAuditReportInputSchema = z.object({
  text: z.string().describe('The text from the energy audit report to rewrite.'),
  outputLanguage: z.string().describe('The desired language for the output (e.g., "en" for English, "vn" for Vietnamese).'),
  config: ModelParametersSchema.optional(),
});
export type RewriteAuditReportInput = z.infer<typeof RewriteAuditReportInputSchema>;

const RewriteAuditReportOutputSchema = z.object({
  rewrittenText: z.string().describe('The rewritten text of the energy audit report.'),
});
export type RewriteAuditReportOutput = z.infer<typeof RewriteAuditReportOutputSchema>;

export async function rewriteAuditReport(input: RewriteAuditReportInput): Promise<RewriteAuditReportOutput> {
  return rewriteAuditReportFlow(input);
}

const rewriteAuditReportPrompt = ai.definePrompt({
  name: 'rewriteAuditReportPrompt',
  input: {schema: RewriteAuditReportInputSchema},
  output: {schema: RewriteAuditReportOutputSchema},
  prompt: `You are an expert in writing energy audit reports. Please rewrite the following text to improve its clarity and professionalism, while maintaining the original meaning.
Generate the response in the following language: {{{outputLanguage}}}

Text to rewrite:
{{{text}}}`,
  config: {
    temperature: 0.7, // Default temperature, can be overridden by input.config
  }
});

const rewriteAuditReportFlow = ai.defineFlow(
  {
    name: 'rewriteAuditReportFlow',
    inputSchema: RewriteAuditReportInputSchema,
    outputSchema: RewriteAuditReportOutputSchema,
  },
  async input => {
    const {output} = await rewriteAuditReportPrompt(input);
    return output!;
  }
);
