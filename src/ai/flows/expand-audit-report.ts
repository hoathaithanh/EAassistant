
// src/ai/flows/expand-audit-report.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for expanding sections of an energy audit report using GenAI.
 * It includes a relevancy check: if the input text is not related to energy auditing,
 * a warning message (styled as bold and italic, followed by a newline) is prepended to the output.
 *
 * - expandAuditReport - A function that expands the given text by adding relevant details and suggestions.
 * - ExpandAuditReportInput - The input type for the expandAuditReport function.
 * - ExpandAuditReportOutput - The return type for the expandAuditReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandAuditReportInputSchema = z.object({
  text: z.string().describe('The text from the energy audit report to expand.'),
  outputLanguage: z.string().describe('The desired language for the output (e.g., "en" for English, "vn" for Vietnamese).'),
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
Your primary task is to expand the following section of an energy audit report.

However, before expanding, you MUST first analyze the 'Original Text' provided below to determine if it is primarily related to energy auditing, energy efficiency, building science, renewable energy, or energy consulting.

If the 'Original Text' IS NOT primarily related to these energy topics, your response for 'expandedText' MUST begin with the warning message formatted in bold and italic using Markdown (triple asterisks), followed by two newline characters (\`\\n\\n\`).
The warning message depends on the '{{{outputLanguage}}}':
- If '{{{outputLanguage}}}' is 'vn', use this exact warning: 'Tôi là AI agent chỉ được đào tạo chuyên môn sâu về lĩnh vực kiểm toán năng lượng, nội dung của bạn yêu cầu ít liên quan đến chuyên môn của tôi. Vì vậy các nội dung dưới đây chỉ mang tính chất tham khảo: '
  Format it like this: \`***Tôi là AI agent chỉ được đào tạo chuyên môn sâu về lĩnh vực kiểm toán năng lượng, nội dung của bạn yêu cầu ít liên quan đến chuyên môn của tôi. Vì vậy các nội dung dưới đây chỉ mang tính chất tham khảo: ***\\n\\n\`
- If '{{{outputLanguage}}}' is 'en', use this exact warning: 'I am an AI agent with deep expertise in energy auditing. Your request seems less related to my specialty. Therefore, the following content is for reference purposes only: '
  Format it like this: \`***I am an AI agent with deep expertise in energy auditing. Your request seems less related to my specialty. Therefore, the following content is for reference purposes only: ***\\n\\n\`
- For any other '{{{outputLanguage}}}', translate the core meaning of the English warning ("I am an AI agent with deep expertise in energy auditing. Your request seems less related to my specialty. Therefore, the following content is for reference purposes only:") into the requested '{{{outputLanguage}}}', and then format it similarly with triple asterisks and two newlines. For example: \`***<Translated Warning>***\\n\\n\`

If the 'Original Text' IS primarily related to energy topics, do NOT include the warning message. Simply proceed to expand the text.

After the relevancy check (and prepending the formatted warning if necessary), expand the 'Original Text' by adding relevant details, suggestions, and context based on your expertise. Even if the text was deemed not directly related to energy, try to provide a helpful and general expansion of the given text AFTER the formatted warning.

Generate the entire response, including any formatted warning and the expanded text, in the '{{{outputLanguage}}}'.

Original Text:
{{{text}}}

Expanded Text:`,
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

