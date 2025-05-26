
/**
 * @fileOverview Zod schemas and TypeScript types for the web search tool.
 * This file does not use the 'use server' directive as it primarily exports type definitions.
 */
import {z} from 'genkit';

export const WebSearchInputSchema = z.object({
  query: z.string().describe('The search query string.'),
  numResults: z.number().optional().default(5).describe('Number of search results to return.'),
  languageCode: z.string().optional().default('en').describe('Language code for search results (e.g., "en", "vn").')
});
export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;

export const SearchResultItemSchema = z.object({
  title: z.string().describe('The title of the search result.'),
  link: z.string().describe('The direct URL to the search result. This should be a real, clickable link.'),
  snippet: z.string().describe('A relevant snippet from the search result content.'),
});

export const WebSearchOutputSchema = z.object({
  results: z.array(SearchResultItemSchema).describe('An array of search results.'),
});
export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>;
