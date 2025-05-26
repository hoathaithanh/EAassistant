'use server';

/**
 * @fileOverview A flow to change the tone of an energy audit report.
 *
 * - changeAuditReportTone - A function that handles the tone change process.
 * - ChangeAuditReportToneInput - The input type for the changeAuditReportTone function.
 * - ChangeAuditReportToneOutput - The return type for the changeAuditReportTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChangeAuditReportToneInputSchema = z.object({
  reportText: z.string().describe('The energy audit report text to modify.'),
  tone: z.string().describe('The desired tone for the report (e.g., professional, humorous, empathetic, formal, friendly).'),
});
export type ChangeAuditReportToneInput = z.infer<typeof ChangeAuditReportToneInputSchema>;

const ChangeAuditReportToneOutputSchema = z.object({
  modifiedReportText: z.string().describe('The energy audit report text with the modified tone.'),
});
export type ChangeAuditReportToneOutput = z.infer<typeof ChangeAuditReportToneOutputSchema>;

export async function changeAuditReportTone(input: ChangeAuditReportToneInput): Promise<ChangeAuditReportToneOutput> {
  return changeAuditReportToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'changeAuditReportTonePrompt',
  input: {schema: ChangeAuditReportToneInputSchema},
  output: {schema: ChangeAuditReportToneOutputSchema},
  prompt: `You are an expert writing assistant. You will be provided with an energy audit report, and a desired tone.

You will rewrite the energy audit report to match the tone requested.

Report Text: {{{reportText}}}

Tone: {{{tone}}}

Rewrite the above report text in the tone specified.`,
});

const changeAuditReportToneFlow = ai.defineFlow(
  {
    name: 'changeAuditReportToneFlow',
    inputSchema: ChangeAuditReportToneInputSchema,
    outputSchema: ChangeAuditReportToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
