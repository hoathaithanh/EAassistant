
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
  type SearchResultItemSchema as SearchResultItem, // Renamed to avoid conflict
} from '@/ai/schemas/web-search-schemas';

// Ensure you have these in your .env file
const GOOGLE_CSE_API_KEY = process.env.SEARCH_API_KEY;
const GOOGLE_CSE_ID = process.env.SEARCH_ENGINE_ID;

if (!GOOGLE_CSE_API_KEY) {
  console.warn(
    'SEARCH_API_KEY (Google CSE API Key) is not set in .env. Web search will not function.'
  );
}
if (!GOOGLE_CSE_ID) {
  console.warn(
    'SEARCH_ENGINE_ID (Google CSE ID) is not set in .env. Web search will not function.'
  );
}

export const performWebSearch = ai.defineTool(
  {
    name: 'performWebSearch',
    description:
      'Performs a web search using the Google Custom Search JSON API and returns a list of relevant documents with titles, homepage links (scheme + hostname), and snippets. Use this tool to find information on the internet for a given query.',
    inputSchema: WebSearchInputSchema,
    outputSchema: WebSearchOutputSchema,
  },
  async (input: WebSearchInput): Promise<WebSearchOutput> => {
    console.log('[performWebSearch] Received input:', JSON.stringify(input, null, 2));

    if (!GOOGLE_CSE_API_KEY) {
      console.error('[performWebSearch] Google Custom Search API Key (SEARCH_API_KEY) is not configured.');
      return {
        results: [
          {
            title: 'Lỗi cấu hình API',
            link: '#',
            snippet:
              'SEARCH_API_KEY (Google CSE API Key) chưa được cấu hình trong biến môi trường. Vui lòng kiểm tra tệp .env.',
          },
        ],
      };
    }
    if (!GOOGLE_CSE_ID) {
      console.error('[performWebSearch] Google Custom Search Engine ID (SEARCH_ENGINE_ID) is not configured.');
      return {
        results: [
          {
            title: 'Lỗi cấu hình CSE ID',
            link: '#',
            snippet:
              'SEARCH_ENGINE_ID (Google CSE ID) chưa được cấu hình trong biến môi trường. Vui lòng kiểm tra tệp .env.',
          },
        ],
      };
    }

    const searchApiEndpoint = 'https://www.googleapis.com/customsearch/v1';
    const url = new URL(searchApiEndpoint);
    url.searchParams.append('key', GOOGLE_CSE_API_KEY);
    url.searchParams.append('cx', GOOGLE_CSE_ID);
    url.searchParams.append('q', input.query);
    url.searchParams.append('num', input.numResults?.toString() || '5');
    if (input.languageCode && input.languageCode !== 'en') { // Google default is 'en'
      url.searchParams.append('lr', `lang_${input.languageCode}`);
    }

    console.log(`[performWebSearch] Calling Google Custom Search API with URL: ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const responseText = await response.text(); // Get text first for logging
      console.log(`[performWebSearch] API Response Status: ${response.status}`);
      console.log(`[performWebSearch] API Raw Response Body (first 500 chars): ${responseText.substring(0, 500)}`);


      if (!response.ok) {
        console.error(`[performWebSearch] Google Custom Search API Error (${response.status}). Body: ${responseText}`);
        let friendlyMessage = `Yêu cầu tìm kiếm thất bại với mã lỗi ${response.status}.`;
        try {
            const jsonError = JSON.parse(responseText);
            if (jsonError.error && jsonError.error.message) {
                friendlyMessage += ` Chi tiết: ${jsonError.error.message}`;
            }
        } catch (e) {
            // JSON parsing failed, use raw text
        }
        return {
          results: [
            {
              title: 'Lỗi khi tìm kiếm trên Web',
              link: '#',
              snippet: friendlyMessage,
            },
          ],
        };
      }

      const data = JSON.parse(responseText); // Parse JSON after successful check

      if (!data.items || data.items.length === 0) {
        console.log('[performWebSearch] No items found in API response.');
        return { results: [] };
      }

      const mappedResults: SearchResultItem[] = data.items
        .map((item: any) => {
          const originalLink = item.link || 'N/A (Link not provided by API)';
          let displayLink = '#'; // Default to '#'

          if (typeof item.link === 'string' && item.link.trim() !== '') {
            try {
              const parsedUrl = new URL(item.link);
              // Explicitly construct the link from protocol and hostname
              displayLink = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
            } catch (e) {
              console.warn(`[performWebSearch] Could not parse item.link to get scheme and hostname. Original link: "${originalLink}". Error: ${(e as Error).message}. Falling back to '#'.`);
              displayLink = '#'; // Fallback if parsing fails
            }
          }
          // Log the original link and the processed displayLink
          console.log(`[performWebSearch] Link processing: Original="${originalLink}", ExtractedSchemeHostname="${displayLink}"`);

          return {
            title: item.title || 'N/A',
            link: displayLink, // This 'link' is what the flow receives
            snippet: item.snippet || item.htmlSnippet || 'N/A',
          };
        })
        .filter((result: SearchResultItem) => result.link && result.link !== '#'); // Filter out any results that ended up with '#'

      console.log('[performWebSearch] Final mapped results (should contain scheme+hostname):', JSON.stringify(mappedResults, null, 2));
      return { results: mappedResults.slice(0, input.numResults) };

    } catch (error: any) {
      console.error('[performWebSearch] Error during web search execution:', error);
      return {
        results: [
          {
            title: 'Lỗi thực thi tìm kiếm trên Web',
            link: '#',
            snippet: `Đã xảy ra lỗi khi thực hiện tìm kiếm: ${error.message}`,
          },
        ],
      };
    }
  }
);
