// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Door } from '@/types/door'
import { logger } from '@/lib/logger'
import { validateNewDoor, sanitizeHtml } from '@/lib/validation'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables')
  logger.error('Supabase configuration error', error)
  throw error
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for door operations

export async function fetchAllDoors(): Promise<Door[]> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all doors
  const { data, error } = await supabase
    .from('doors')
    .select('*')

  if (error) {
    logger.error('Error fetching doors from database', error)
    return []
  }

  // Fetch user's favorites if logged in
  let userFavorites: Set<string> = new Set()
  if (user) {
    const { data: favoritesData } = await supabase
      .from('user_favorites')
      .select('door_id')
      .eq('user_id', user.id)

    if (favoritesData) {
      userFavorites = new Set(favoritesData.map(fav => fav.door_id))
    }
  }

  // Transform Supabase data to Door type
  const doors = data.map(door => ({
    id: door.id,
    imageUrl: door.image_url,
    location: door.location,
    neighborhood: door.neighborhood,
    material: door.material,
    color: door.color,
    style: door.style,
    arrondissement: door.arrondissement,
    ornamentations: door.ornamentations || [],
    description: door.description,
    isFavorite: userFavorites.has(door.id), // User-specific favorite
    coordinates: door.coordinates,
    dateAdded: door.date_added,
    addedBy: door.added_by,
    userId: door.user_id
  }))

  // Randomize the order using Fisher-Yates shuffle
  for (let i = doors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doors[i], doors[j]] = [doors[j], doors[i]];
  }

  return doors
}

export async function addDoor(door: Omit<Door, 'id'>): Promise<Door | null> {
  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logger.warn('Attempted to add door without authentication')
    return null
  }

  // Validate input data
  const validation = validateNewDoor(door)
  if (!validation.success) {
    logger.error('Invalid door data', validation.errors, { location: door.location })
    return null
  }

  // Use validated and sanitized data
  const validatedDoor = validation.data

  // Sanitize description if present
  if (validatedDoor.description) {
    validatedDoor.description = sanitizeHtml(validatedDoor.description)
  }

  // First, upload the image if it's a base64 string
  let imageUrl = validatedDoor.imageUrl

  if (validatedDoor.imageUrl.startsWith('data:image')) {
    imageUrl = await uploadImage(validatedDoor.imageUrl)
    if (!imageUrl) {
      logger.error('Failed to upload image to storage')
      return null
    }
  }

  // Insert door into database with user_id
  const { data, error } = await supabase
    .from('doors')
    .insert([
      {
        user_id: user.id,
        image_url: imageUrl,
        location: validatedDoor.location,
        neighborhood: validatedDoor.neighborhood,
        material: validatedDoor.material,
        color: validatedDoor.color,
        style: validatedDoor.style,
        arrondissement: validatedDoor.arrondissement,
        ornamentations: validatedDoor.ornamentations || [],
        description: validatedDoor.description,
        is_favorite: validatedDoor.isFavorite || false,
        coordinates: validatedDoor.coordinates,
        date_added: validatedDoor.dateAdded || new Date().toISOString(),
        added_by: validatedDoor.addedBy || 'user'
      }
    ])
    .select()
    .single()

  if (error) {
    logger.error('Error inserting door into database', error, { location: validatedDoor.location })
    return null
  }

  return {
    id: data.id,
    imageUrl: data.image_url,
    location: data.location,
    neighborhood: data.neighborhood,
    material: data.material,
    color: data.color,
    style: data.style,
    arrondissement: data.arrondissement,
    ornamentations: data.ornamentations || [],
    description: data.description,
    isFavorite: data.is_favorite,
    coordinates: data.coordinates,
    dateAdded: data.date_added,
    addedBy: data.added_by,
    userId: data.user_id
  }
}

export async function toggleFavoriteDoor(doorId: string, isFavorite: boolean): Promise<boolean> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logger.warn('Attempted to toggle favorite without authentication')
    return false
  }

  try {
    if (isFavorite) {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          door_id: doorId
        })

      if (error) {
        // Ignore unique constraint violations (already favorited)
        if (error.code !== '23505') {
          logger.error('Error adding favorite', error, { doorId, userId: user.id })
          return false
        }
      }
    } else {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('door_id', doorId)

      if (error) {
        logger.error('Error removing favorite', error, { doorId, userId: user.id })
        return false
      }
    }

    return true
  } catch (error) {
    logger.error('Exception while toggling favorite', error, { doorId, isFavorite })
    return false
  }
}

async function uploadImage(base64Image: string): Promise<string | null> {
  try {
    // Security check: validate base64 image format
    if (!base64Image.startsWith('data:image/')) {
      logger.error('Invalid image format - not a data URL')
      return null
    }

    // Convert base64 to blob
    const response = await fetch(base64Image)
    const blob = await response.blob()

    // Security check: validate blob size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (blob.size > MAX_SIZE) {
      logger.error('Image file too large', undefined, { size: blob.size, maxSize: MAX_SIZE })
      return null
    }

    // Security check: validate MIME type
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!ALLOWED_TYPES.includes(blob.type)) {
      logger.error('Invalid image MIME type', undefined, { type: blob.type })
      return null
    }

    // Generate unique filename with proper extension
    const extension = blob.type.split('/')[1] || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    const filePath = `doors/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('door-images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (error) {
      logger.error('Error uploading image to Supabase storage', error, { filePath })
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('door-images')
      .getPublicUrl(data.path)

    logger.info('Image uploaded successfully', { publicUrl, filePath })
    return publicUrl
  } catch (error) {
    logger.error('Error processing image for upload', error)
    return null
  }
}