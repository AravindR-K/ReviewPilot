import { z } from 'zod';

export const AnalyzerOutputSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  topics: z.array(z.enum([
    'taste', 'quantity', 'delivery_time', 'packaging',
    'price', 'hygiene', 'portion_size', 'staff_behavior',
  ])),
  urgency: z.enum(['normal', 'urgent']),
  urgency_reason: z.string().nullable(),
});

export type AnalyzerOutput = z.infer<typeof AnalyzerOutputSchema>;
