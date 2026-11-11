import { z } from 'zod';

export const CreateReviewSchema = z.object({
  platform: z.enum(['google', 'swiggy', 'zomato', 'form']).default('form'),
  platformId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  reviewText: z.string().min(1, 'Review text is required'),
});

export const ImportReviewsSchema = z.object({
  reviews: z.array(CreateReviewSchema).min(1),
});

export const ApproveReviewSchema = z.object({
  approvedBy: z.string().optional().default('owner'),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
