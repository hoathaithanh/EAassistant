
'use server';
/**
 * @fileOverview A Genkit flow to perform deep research based on input text using a web search tool.
 *
 * - deepResearch - A function that uses a tool to search the web for related documents.
 * - DeepResearchInput - The input type for the deepResearch function.
 * - DeepResearchOutput - The return type for the deepResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {performWebSearch} from '@/ai/tools/web-search-tool'; // Import the tool
import { 
  WebSearchOutputSchema, // Correctly import WebSearchOutputSchema
  type WebSearchOutput // Correctly import WebSearchOutput type
} from '@/ai/schemas/web-search-schemas';


const DeepResearchInputSchema = z.object({
  inputText: z.string().describe('The text to base the research on.'),
  outputLanguage: z.string().describe('The desired language for the output and search (e.g., "en" for English, "vn" for Vietnamese).'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

// Alias WebSearchOutputSchema as DeepResearchOutputSchema for clarity within this flow
// It is NOT exported from this 'use server' file.
const DeepResearchOutputSchema = WebSearchOutputSchema;
// Infer DeepResearchOutput type from the aliased schema.
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;


export async function deepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema}, // Use the (non-exported) aliased schema
  tools: [performWebSearch], // Make the tool available to the LLM
  system: `You are an AI assistant. Your task is to help the user find relevant online resources based on the provided text.
1. Use the 'performWebSearch' tool to search the internet. The user's input text should be your primary query for the tool. The 'outputLanguage' field from the input should be passed as 'languageCode' to the 'performWebSearch' tool.
2. The tool will return a list of search results, each containing a title, a link, and a snippet.
3. You MUST use the information returned by the 'performWebSearch' tool to populate the 'results' field in your output.
4. Ensure the output strictly adheres to the 'DeepResearchOutputSchema'.
5. If the 'performWebSearch' tool returns no results, or if the results are not relevant, you should return an empty array for the 'results' field.
6. The search query to the tool should be based on the user's 'inputText'. The titles and snippets in the output should reflect the language of the search results, which is influenced by the 'languageCode' passed to the tool.
   Make sure to request a reasonable number of results from the tool, for example, 5.
`,
  prompt: `
Input Text for Research:
{{{inputText}}}

Desired Output Language for results (this determines the languageCode for the search tool): {{{outputLanguage}}}

Based on the system instructions, invoke the 'performWebSearch' tool.
Use the 'inputText' as the basis for the 'query' parameter of the tool.
Use the 'outputLanguage' as the 'languageCode' parameter for the tool.
Request 5 results from the tool.

Then, formulate your response according to the DeepResearchOutputSchema using the results from the tool.
If the tool provides no relevant results, ensure the 'results' array is empty.
`,
});

const deepResearchFlow = ai.defineFlow(
  {
    name: 'deepResearchFlow',
    inputSchema: DeepResearchInputSchema,
    outputSchema: DeepResearchOutputSchema, // Use the (non-exported) aliased schema
  },
  async (input: DeepResearchInput) => {
    // The prompt, when configured with tools, will handle calling the tool
    // if the LLM decides it's necessary based on the prompt instructions.
    // The LLM will receive the tool's output and use it to generate its final response.
    const llmResponse = await prompt(input); // Pass the flow's input directly to the prompt

    // Ensure the output is always in the correct format, even if the LLM fails or tool returns nothing.
    if (llmResponse.output && Array.isArray(llmResponse.output.results)) {
        return llmResponse.output;
    }
    // Fallback if LLM output is not as expected or tool failed silently
    return { results: [] };
  }
);

