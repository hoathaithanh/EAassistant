
'use server';
/**
 * @fileOverview A Genkit flow to perform deep research based on input text.
 *
 * - deepResearch - A function that simulates an internet search for related documents.
 * - DeepResearchInput - The input type for the deepResearch function.
 * - DeepResearchOutput - The return type for the deepResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeepResearchInputSchema = z.object({
  inputText: z.string().describe('The text to base the research on.'),
  outputLanguage: z.string().describe('The desired language for the output (e.g., "en" for English, "vn" for Vietnamese).'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

const ResearchResultItemSchema = z.object({
  title: z.string().describe('The title of the research finding.'),
  snippet: z.string().describe('A relevant snippet from the research finding.'),
  link: z
    .string()
    .describe(
      'A highly plausible and specific-looking URL to the research finding. It should appear authentic and relevant to the type of resource (e.g., https://www.some-manufacturer.com/manuals/product.pdf, https://www.supplier-corp.com/products/widget, https://www.researchportal.org/paper/123).'
    ),
});

const DeepResearchOutputSchema = z.object({
  results: z.array(ResearchResultItemSchema).describe('An array of research findings.'),
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;

export async function deepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  prompt: `You are a highly capable AI research assistant. Based on the provided text, you need to find and list relevant online resources.
For each resource, provide a concise title, a short snippet of relevant content, and a highly plausible and specific-looking URL.
The resources should include technical documents, supplier websites, research papers, articles detailing solutions, and equipment price information if applicable.
The search should be comprehensive and aim to provide actionable information related to the input text.
Generate the response in the following language: {{{outputLanguage}}}.

Input Text:
{{{inputText}}}

Think step-by-step:
1. Understand the key topics and entities in the input text.
2. Imagine performing searches on these topics using a search engine like Google.
3. For at least 3-5 of the most relevant imagined search results, extract or generate a suitable title, a concise snippet highlighting the relevance, and a **highly plausible and specific-looking URL**. The URL should appear authentic and relevant to the type of resource. For example:
    - For a technical document: https://www.some-manufacturer.com/support/manuals/product-model-123.pdf
    - For a supplier website: https://www.industrial-supplier-corp.com/products/energy-efficient-motors
    - For a research paper: https://www.researchgate.net/publication/123456789_Study_on_New_Energy_Solutions or https://arxiv.org/abs/2301.00123
    - For an article: https://www.industry-insights-online.com/articles/advancements-in-solar-technology
    - For pricing info: https://www.equipment-marketplace.com/listings/item/industrial-chiller-xyz/price
    Avoid generic placeholders like 'example.com'. Aim for URLs that, while potentially fictional, mirror the structure and specificity of real web addresses for such resources.
4. Ensure the output format is strictly an array of objects, each with "title", "snippet", and "link". If no relevant results can be found, return an empty array for "results".`,
});

const deepResearchFlow = ai.defineFlow(
  {
    name: 'deepResearchFlow',
    inputSchema: DeepResearchInputSchema,
    outputSchema: DeepResearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { results: [] }; // Ensure results is always an array
  }
);

