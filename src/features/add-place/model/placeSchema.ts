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

const isValidLatitude = (val: string): boolean => {
  const trimmed = val.trim();
  if (!trimmed) {
    return false;
  }
  const parsed = Number(trimmed);
  return !Number.isNaN(parsed) && parsed >= -90 && parsed <= 90;
};

const isValidLongitude = (val: string): boolean => {
  const trimmed = val.trim();
  if (!trimmed) {
    return false;
  }
  const parsed = Number(trimmed);
  return !Number.isNaN(parsed) && parsed >= -180 && parsed <= 180;
};

export const placeFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Title must contain at least 2 characters')
      .max(80, 'Title must not exceed 80 characters'),
    address: z
      .string()
      .trim()
      .max(160, 'Address must not exceed 160 characters'),
    description: z
      .string()
      .trim()
      .max(300, 'Description must not exceed 300 characters')
      .optional(),
    category: placeCategoryEnum,
    latitude: z.string().trim(),
    longitude: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    const hasAddress = values.address.trim().length >= 3;
    const hasLatInput = values.latitude.trim().length > 0;
    const hasLonInput = values.longitude.trim().length > 0;

    if (hasLatInput && !isValidLatitude(values.latitude)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitude'],
        message: 'Latitude must be a number between -90 and 90',
      });
    }

    if (hasLonInput && !isValidLongitude(values.longitude)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['longitude'],
        message: 'Longitude must be a number between -180 and 180',
      });
    }

    if (hasLatInput !== hasLonInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [hasLatInput ? 'longitude' : 'latitude'],
        message: 'Provide both latitude and longitude or leave both empty',
      });
    }

    const hasValidCoords =
      isValidLatitude(values.latitude) && isValidLongitude(values.longitude);

    if (!hasAddress && !hasValidCoords) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message:
          'Enter either an address (min 3 chars) or valid coordinates ( the other will auto-fill )',
      });
    }
  });

export type PlaceFormValues = z.infer<typeof placeFormSchema>;
