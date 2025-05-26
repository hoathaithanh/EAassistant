
import { config } from 'dotenv';
config();

import '@/ai/flows/rewrite-audit-report.ts';
import '@/ai/flows/change-audit-report-tone.ts';
import '@/ai/flows/summarize-audit-report.ts';
import '@/ai/flows/expand-audit-report.ts';
import '@/ai/flows/deep-research-flow.ts';
// It's good practice to import tool definitions if they are in separate files,
// though Genkit often discovers tools used in flows automatically.
// If you encounter issues with the tool not being found, explicitly importing it can help.
import '@/ai/tools/web-search-tool.ts';
