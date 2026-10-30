import { z } from 'zod';

// Same rules as the client forms. The server checks again because a request can bypass the browser.
export const bookingSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(100),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number'),
    destination: z.string().trim().min(2, 'Tell us where you would like to go').max(150),
    startDate: z.string().min(1, 'Choose a start date'),
    endDate: z.string().min(1, 'Choose an end date'),
    travelers: z.coerce.number().int().min(1, 'At least 1 traveler').max(50, 'Up to 50 travelers'),
    requests: z.string().trim().max(1000, 'Keep it under 1000 characters').optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  message: z.string().trim().min(10, 'Message should be at least 10 characters').max(2000),
});

export type BookingRequest = z.infer<typeof bookingSchema>;
export type Enquiry = z.infer<typeof enquirySchema>;
