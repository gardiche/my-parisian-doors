// src/lib/validation.ts
// Input validation and sanitization using Zod

import { z } from 'zod';
import { DoorMaterial, DoorColor, DoorStyle, DoorArrondissement, DoorOrnamentation } from '@/types/door';

// Regex patterns for validation
const COORDINATES_REGEX = /^-?\d+\.\d+$/;
const BASE64_IMAGE_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,/;
const URL_IMAGE_REGEX = /^https:\/\/.+\.(jpg|jpeg|png|webp)$/i;

// Validation schemas

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const doorMaterialSchema = z.enum(['Wood', 'Metal', 'Glass', 'Stone', 'Composite']);
export const doorColorSchema = z.enum(['Green', 'Blue', 'Black', 'White', 'Cream', 'Brown', 'Red', 'Gray']);
export const doorStyleSchema = z.enum(['Haussmann', 'Art Nouveau', 'Modern', 'Vintage', 'Industrial', 'Classic']);
export const doorOrnamentationSchema = z.enum([
  'Ironwork',
  'Stained Glass',
  'Wood Carving',
  'Columns',
  'Pediment',
  'Door Knocker',
  'Moldings',
  'Flowers',
  'Golden Details',
]);

export const doorArrondissementSchema = z.enum([
  '1st — Louvre',
  '2nd — Bourse',
  '3rd — Le Marais (Temple)',
  '4th — Hôtel-de-Ville (Le Marais, Île Saint-Louis)',
  '5th — Panthéon (Quartier Latin)',
  '6th — Luxembourg (Saint-Germain-des-Prés)',
  '7th — Palais-Bourbon (Tour Eiffel, Invalides)',
  '8th — Élysée (Champs-Élysées, Madeleine)',
  '9th — Opéra (Pigalle Sud)',
  '10th — Entrepôt (Canal Saint-Martin)',
  '11th — Popincourt (Oberkampf, Bastille)',
  '12th — Reuilly (Bercy, Daumesnil)',
  '13th — Gobelins (Butte-aux-Cailles, Chinatown)',
  '14th — Observatoire (Montparnasse)',
  '15th — Vaugirard',
  '16th — Passy (Trocadéro, Auteuil)',
  '17th — Batignolles-Monceau',
  '18th — Montmartre (Butte-Montmartre)',
  '19th — Buttes-Chaumont (La Villette)',
  '20th — Ménilmontant (Belleville, Père-Lachaise)',
]);

// New door input validation schema
export const newDoorInputSchema = z.object({
  // Image URL - must be base64 or HTTPS URL
  imageUrl: z.string()
    .min(1, 'Image is required')
    .refine(
      (val) => BASE64_IMAGE_REGEX.test(val) || URL_IMAGE_REGEX.test(val),
      'Image must be a valid base64 data URL or HTTPS image URL'
    ),

  // Location - required, sanitized
  location: z.string()
    .trim()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters')
    .transform((val) => val.replace(/\s+/g, ' ')), // Normalize multiple spaces

  // Neighborhood - required, sanitized
  neighborhood: z.string()
    .trim()
    .min(2, 'Neighborhood must be at least 2 characters')
    .max(100, 'Neighborhood must not exceed 100 characters')
    .transform((val) => val.replace(/\s+/g, ' ')),

  // Material - enum
  material: doorMaterialSchema,

  // Color - enum
  color: doorColorSchema,

  // Style - enum
  style: doorStyleSchema,

  // Arrondissement - optional enum
  arrondissement: doorArrondissementSchema.optional(),

  // Ornamentations - optional array
  ornamentations: z.array(doorOrnamentationSchema).optional(),

  // Description - optional, sanitized
  description: z.string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .transform((val) => val ? val.replace(/\s+/g, ' ') : undefined),

  // Favorite - boolean
  isFavorite: z.boolean().default(false),

  // Coordinates - optional, validated
  coordinates: coordinatesSchema.optional(),

  // Date added - ISO string
  dateAdded: z.string().datetime().optional(),

  // Added by - enum
  addedBy: z.enum(['user', 'preset']).optional(),
});

// Type inference from schema
export type NewDoorInput = z.infer<typeof newDoorInputSchema>;

// Validation helper function
export function validateNewDoor(data: unknown): { success: true; data: NewDoorInput } | { success: false; errors: z.ZodError } {
  const result = newDoorInputSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

// Sanitize HTML content (for descriptions)
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

// Validate image file size (client-side check)
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${MAX_SIZE / (1024 * 1024)}MB.`,
    };
  }

  return { valid: true };
}

// Rate limiting helper (client-side)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const cached = rateLimitCache.get(key);

  if (!cached || now > cached.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (cached.count >= maxRequests) {
    return false;
  }

  cached.count++;
  return true;
}
