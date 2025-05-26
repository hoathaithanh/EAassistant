import { config } from 'dotenv';
config();

import '@/ai/flows/rewrite-audit-report.ts';
import '@/ai/flows/change-audit-report-tone.ts';
import '@/ai/flows/summarize-audit-report.ts';
import '@/ai/flows/expand-audit-report.ts';