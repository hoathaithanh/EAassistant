
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type { GenerationCommonConfig } from 'genkit';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

// This function provides a base configuration. In a real app, you might fetch
// these values from a user's settings, a database, or environment variables.
export function getConfig(
  customConfig: Partial<GenerationCommonConfig> = {}
): GenerationCommonConfig {
  const defaults: GenerationCommonConfig = {
    temperature: 0.3,
    topP: 0.3,
    topK: 20,
    maxOutputTokens: 2048,
    // frequencyPenalty and presencePenalty are not standard in Gemini,
    // but are kept here as placeholders if you switch to a model that supports them.
  };

  // Filter out undefined values from customConfig before merging
  const filteredCustomConfig = Object.fromEntries(
    Object.entries(customConfig).filter(([, value]) => value !== undefined)
  );
  
  return {...defaults, ...filteredCustomConfig};
}
