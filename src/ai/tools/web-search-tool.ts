
'use server';
/**
 * @fileOverview A Genkit tool for performing real web searches using Google Custom Search JSON API.
 *
 * - performWebSearch - The tool function that calls the Google Custom Search API.
 */

import {ai} from '@/ai/genkit';
import {
  WebSearchInputSchema,
  WebSearchOutputSchema,
  type WebSearchInput,
  type WebSearchOutput,
  type SearchResultItemSchema as SearchResultItem, // Import the type directly
} from '@/ai/schemas/web-search-schemas';

const GOOGLE_CSE_API_KEY = process.env.SEARCH_API_KEY;
const GOOGLE_CSE_ID = process.env.SEARCH_ENGINE_ID; // You'll need to add this to your .env

if (!GOOGLE_CSE_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn(
    'SEARCH_API_KEY (Google CSE API Key) is not set. Real web search will not function optimally in production.'
  );
}
if (!GOOGLE_CSE_ID && process.env.NODE_ENV === 'production') {
  console.warn(
    'SEARCH_ENGINE_ID (Google CSE ID) is not set. Real web search will not function in production.'
  );
}

export const performWebSearch = ai.defineTool(
  {
    name: 'performWebSearch',
    description:
      'Performs a web search using the Google Custom Search JSON API and returns a list of relevant documents with titles, links, and snippets. Use this tool to find information on the internet.',
    inputSchema: WebSearchInputSchema,
    outputSchema: WebSearchOutputSchema,
  },
  async (input: WebSearchInput): Promise<WebSearchOutput> => {
    if (!GOOGLE_CSE_API_KEY) {
      console.error('Google Custom Search API Key (SEARCH_API_KEY) is not configured.');
      return {
        results: [
          {
            title: 'Search API Key Not Configured',
            link: '#',
            snippet:
              'The web search tool requires a Google Custom Search API Key (SEARCH_API_KEY) which has not been provided. Please configure it in your environment variables.',
          },
        ],
      };
    }
    if (!GOOGLE_CSE_ID) {
      console.error('Google Custom Search Engine ID (SEARCH_ENGINE_ID) is not configured.');
      return {
        results: [
          {
            title: 'Search Engine ID Not Configured',
            link: '#',
            snippet:
              'The web search tool requires a Google Custom Search Engine ID (SEARCH_ENGINE_ID) which has not been provided. Please configure it in your environment variables.',
          },
        ],
      };
    }

    const searchApiEndpoint = 'https://www.googleapis.com/customsearch/v1';
    const url = new URL(searchApiEndpoint);
    url.searchParams.append('key', GOOGLE_CSE_API_KEY);
    url.searchParams.append('cx', GOOGLE_CSE_ID);
    url.searchParams.append('q', input.query);
    url.searchParams.append('num', input.numResults?.toString() || '5'); // Default to 5 results if not specified
    if (input.languageCode && input.languageCode !== 'en') { // Google default is 'en'
      url.searchParams.append('lr', `lang_${input.languageCode}`);
      // Note: Google also supports 'hl' for host language of the UI, but 'lr' restricts search docs by language.
    }

    console.log(`Performing search with Google Custom Search API: ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Google Custom Search API Error (${response.status}): ${errorBody}`);
        let friendlyMessage = `Search API request failed with status ${response.status}.`;
        try {
            const jsonError = JSON.parse(errorBody);
            if (jsonError.error && jsonError.error.message) {
                friendlyMessage += ` Message: ${jsonError.error.message}`;
            }
        } catch (e) {
            friendlyMessage += ` Response: ${errorBody}`;
        }
        return {
          results: [
            {
              title: 'Error During Web Search',
              link: '#',
              snippet: friendlyMessage,
            },
          ],
        };
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return { results: [] }; // No results found
      }

      const mappedResults: SearchResultItem[] = data.items
        .map((item: any) => ({
          title: item.title || 'N/A',
          link: item.link || '#',
          snippet: item.snippet || item.htmlSnippet || 'N/A', // Use htmlSnippet if snippet is not available
        }))
        .filter((result: SearchResultItem) => result.link && result.link !== '#'); // Filter out items without a valid link

      return { results: mappedResults.slice(0, input.numResults) };

    } catch (error) {
      console.error('Error performing web search with Google Custom Search API:', error);
      return {
        results: [
          {
            title: 'Error During Web Search Execution',
            link: '#',
            snippet: `An error occurred while trying to perform the web search: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);
