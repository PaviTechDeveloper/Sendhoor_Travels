import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  message: z.string().trim().min(10, 'Message should be at least 10 characters').max(2000),
});

export type ContactMessage = z.infer<typeof contactSchema>;
