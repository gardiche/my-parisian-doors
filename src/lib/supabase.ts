// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Door } from '@/types/door'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for door operations

export async function fetchAllDoors(): Promise<Door[]> {
  const { data, error } = await supabase
    .from('doors')
    .select('*')

  if (error) {
    console.error('Error fetching doors:', error)
    return []
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
    isFavorite: door.is_favorite || false,
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
    console.error('User must be authenticated to add doors')
    return null
  }

  // First, upload the image if it's a base64 string
  let imageUrl = door.imageUrl

  if (door.imageUrl.startsWith('data:image')) {
    imageUrl = await uploadImage(door.imageUrl)
    if (!imageUrl) {
      console.error('Failed to upload image')
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
        location: door.location,
        neighborhood: door.neighborhood,
        material: door.material,
        color: door.color,
        style: door.style,
        arrondissement: door.arrondissement,
        ornamentations: door.ornamentations || [],
        description: door.description,
        is_favorite: door.isFavorite || false,
        coordinates: door.coordinates,
        date_added: door.dateAdded || new Date().toISOString(),
        added_by: door.addedBy || 'user'
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding door:', error)
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
  const { error } = await supabase
    .from('doors')
    .update({ is_favorite: isFavorite })
    .eq('id', doorId)

  if (error) {
    console.error('Error updating favorite:', error)
    return false
  }

  return true
}

async function uploadImage(base64Image: string): Promise<string | null> {
  try {
    // Convert base64 to blob
    const response = await fetch(base64Image)
    const blob = await response.blob()

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    const filePath = `doors/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('door-images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('door-images')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error processing image:', error)
    return null
  }
}