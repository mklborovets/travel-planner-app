import {z} from 'zod';

const placeCategoryEnum = z.enum([
  'coffee',
  'restaurant',
  'museum',
  'park',
  'sightseeing',
  'hotel',
  'shopping',
  'nature',
  'entertainment',
  'bar',
  'transport',
  'other',
]);

export const placeFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must contain at least 2 characters')
    .max(80, 'Title must not exceed 80 characters'),
  address: z
    .string()
    .trim()
    .min(3, 'Address must contain at least 3 characters')
    .max(160, 'Address must not exceed 160 characters'),
  description: z
    .string()
    .trim()
    .max(300, 'Description must not exceed 300 characters')
    .optional(),
  category: placeCategoryEnum,
  latitude: z
    .string()
    .trim()
    .min(1, 'Latitude is required')
    .refine(
      val => {
        const parsed = Number(val);
        return !Number.isNaN(parsed) && parsed >= -90 && parsed <= 90;
      },
      {message: 'Latitude must be a number between -90 and 90'},
    ),
  longitude: z
    .string()
    .trim()
    .min(1, 'Longitude is required')
    .refine(
      val => {
        const parsed = Number(val);
        return !Number.isNaN(parsed) && parsed >= -180 && parsed <= 180;
      },
      {message: 'Longitude must be a number between -180 and 180'},
    ),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;
