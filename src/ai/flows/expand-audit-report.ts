
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
import { ModelParametersSchema } from '@/ai/schemas/model-parameters-schema';

const ExpandAuditReportInputSchema = z.object({
  text: z.string().describe('The text from the energy audit report to expand.'),
  outputLanguage: z.string().describe('The desired language for the output (e.g., "en" for English, "vn" for Vietnamese).'),
  config: ModelParametersSchema.optional(),
});
export type ExpandAuditReportInput = z.infer<typeof ExpandAuditReportInputSchema>;

const ExpandAuditReportOutputSchema = z.object({
  expandedText: z.string().describe('The expanded text with added details and suggestions. May include a bold and italic warning if the input text was not relevant to energy auditing, followed by a newline.'),
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
Your task is to expand the following section of an energy audit report.

First, analyze the "Original Text" to determine if it is primarily related to energy auditing, energy efficiency, building science, renewable energy, or energy consulting.

- If the text is NOT related to these energy topics, your response for "expandedText" MUST begin with the specific warning message below, formatted in bold and italic and followed by two newlines. You must translate this warning into the requested 'outputLanguage'.
  - Vietnamese warning: "***Tôi là AI agent chỉ được đào tạo chuyên môn sâu về lĩnh vực kiểm toán năng lượng, nội dung của bạn yêu cầu ít liên quan đến chuyên môn của tôi. Vì vậy các nội dung dưới đây chỉ mang tính chất tham khảo: ***\\n\\n"
  - English warning: "***I am an AI agent with deep expertise in energy auditing. Your request seems less related to my specialty. Therefore, the following content is for reference purposes only: ***\\n\\n"
- If the text IS related to energy topics, DO NOT include the warning message.

After the relevance check (and adding the warning if necessary), proceed to expand the "Original Text" by adding relevant details, suggestions, and context based on your expertise. Even if the text is not directly energy-related, provide a useful, general expansion of the given text.

The entire response, including any warning and the expanded text, must be generated in the language specified by 'outputLanguage'.

Original Text: {{{text}}}
Output Language: {{{outputLanguage}}}`,
});

const expandAuditReportFlow = ai.defineFlow(
  {
    name: 'expandAuditReportFlow',
    inputSchema: ExpandAuditReportInputSchema,
    outputSchema: ExpandAuditReportOutputSchema,
  },
  async input => {
    try {
      const {output} = await expandAuditReportPrompt(input);
      // The prompt now handles the null check implicitly by its schema, but a check here is good practice.
      if (output) {
        return output;
      } else {
        // This case handles if the model somehow returns a null/undefined response despite the schema.
        console.warn('[expandAuditReportFlow] LLM returned a null/undefined output. Returning empty string.');
        return { expandedText: '' };
      }
    } catch (error) {
      console.error('[expandAuditReportFlow] Error executing prompt:', error);
      // This will catch schema validation errors (e.g., model returns something other than { expandedText: '...' })
      // or other runtime errors during the prompt execution.
      return { expandedText: '' }; // Return a valid, empty response to the client.
    }
  }
);
