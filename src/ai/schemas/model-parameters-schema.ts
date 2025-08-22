/**
 * @fileOverview Zod schema and TypeScript types for the LLM model parameters.
 * This file does not use the 'use server' directive as it only exports schemas and types.
 */
import { z } from 'genkit';

export const ModelParametersSchema = z.object({
  temperature: z.number().optional(),
  topP: z.number().optional(),
  topK: z.number().optional(),
  maxOutputTokens: z.number().optional(),
});

export type ModelParameters = z.infer<typeof ModelParametersSchema>;
