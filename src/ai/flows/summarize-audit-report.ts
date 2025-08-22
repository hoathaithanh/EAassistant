
// SummarizeAuditReport.ts
'use server';

/**
 * @fileOverview Summarizes a section of an energy audit report.
 *
 * - summarizeAuditReport - A function that summarizes an audit report section.
 * - SummarizeAuditReportInput - The input type for the summarizeAuditReport function.
 * - SummarizeAuditReportOutput - The return type for the summarizeAuditReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ModelParametersSchema } from '@/ai/schemas/model-parameters-schema';


const SummarizeAuditReportInputSchema = z.object({
  reportSection: z
    .string()
    .describe('A section of an energy audit report to summarize.'),
  outputLanguage: z.string().describe('The desired language for the output (e.g., "en" for English, "vn" for Vietnamese).'),
  config: ModelParametersSchema.optional(),
});
export type SummarizeAuditReportInput = z.infer<
  typeof SummarizeAuditReportInputSchema
>;

const SummarizeAuditReportOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the report section.'),
});
export type SummarizeAuditReportOutput = z.infer<
  typeof SummarizeAuditReportOutputSchema
>;

export async function summarizeAuditReport(
  input: SummarizeAuditReportInput
): Promise<SummarizeAuditReportOutput> {
  return summarizeAuditReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAuditReportPrompt',
  input: {schema: SummarizeAuditReportInputSchema},
  output: {schema: SummarizeAuditReportOutputSchema},
  prompt: `You are an expert energy auditor. Please provide a concise summary of the following section of an energy audit report.
Generate the response in the following language: {{{outputLanguage}}}.

Report Section:
{{{reportSection}}}`,
});

const summarizeAuditReportFlow = ai.defineFlow(
  {
    name: 'summarizeAuditReportFlow',
    inputSchema: SummarizeAuditReportInputSchema,
    outputSchema: SummarizeAuditReportOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output || { summary: '' };
    } catch (error) {
      console.error('[summarizeAuditReportFlow] Error:', error);
      return { summary: '' };
    }
  }
);
