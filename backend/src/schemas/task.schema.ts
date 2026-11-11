import { z } from 'zod';

export const UpdateTaskSchema = z.object({
  status: z.enum(['open', 'in_progress', 'done']),
});
