
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
  prompt: `You are an expert AI research assistant. Your primary task is to find highly relevant online resources based on the user's provided text.

1.  **Analyze the Input:** First, carefully analyze the user's 'inputText' to identify the core subject, key topics, and important keywords.
2.  **Formulate an Effective Query:** Based on your analysis, construct a concise and effective search query for the 'performWebSearch' tool. Do not simply pass the entire input text. Instead, create a query that targets the most essential concepts. For example, if the text is about "energy savings from LED lighting in commercial buildings", a good query would be "LED lighting energy efficiency commercial buildings" or "commercial building energy audit LED savings".
3.  **Use the Tool:** Invoke the 'performWebSearch' tool with your formulated query. Pass the user's 'outputLanguage' as the 'languageCode' parameter to get results in the correct language. Request 5 results.
4.  **Format the Output:** Use the results returned by the tool to populate the 'results' field in your final output. Ensure the output strictly adheres to the schema. If the tool returns no results, return an empty array for the 'results' field.

Input Text to Analyze:
{{{inputText}}}

Desired Language for Search Results: {{{outputLanguage}}}

Now, perform the analysis, formulate the best search query, and call the tool to get the most relevant documents.
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
