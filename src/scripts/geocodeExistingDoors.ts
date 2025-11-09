// Script to geocode all existing doors in Supabase
import { supabase } from '../lib/supabase';
import { Door, DoorArrondissement } from '../types/door';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const geocodeAddress = async (address: string, arrondissement: DoorArrondissement): Promise<{lat: number, lng: number} | null> => {
  try {
    // Extract postal code from arrondissement
    const postalCode = arrondissement.match(/^(\d+)/)?.[1];
    const fullPostalCode = postalCode ? `750${postalCode.padStart(2, '0')}` : '75001';

    // Build full address for geocoding
    const fullAddress = `${address}, ${fullPostalCode}, Paris, France`;

    console.log(`Geocoding: ${fullAddress}`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
      {
        headers: {
          'User-Agent': 'MyParisianDoors/1.0'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log(`✓ Found coordinates: ${coords.lat}, ${coords.lng}`);
        return coords;
      }
    }
    console.log('✗ No coordinates found');
  } catch (error) {
    console.error('Error geocoding address:', error);
  }
  return null;
};

export async function geocodeAllDoors() {
  console.log('🚀 Starting geocoding migration...\n');

  // Fetch all doors from Supabase
  const { data: doors, error } = await supabase
    .from('doors')
    .select('*');

  if (error) {
    console.error('❌ Error fetching doors:', error);
    return;
  }

  if (!doors || doors.length === 0) {
    console.log('No doors found in database');
    return;
  }

  console.log(`Found ${doors.length} doors to process\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const door of doors) {
    console.log(`\n📍 Processing door: ${door.id} - ${door.location}`);

    // Skip if already has valid coordinates
    if (door.coordinates && door.coordinates.lat && door.coordinates.lng) {
      console.log('  ⏭️  Already has coordinates, skipping');
      skipped++;
      continue;
    }

    if (!door.location || !door.arrondissement) {
      console.log('  ⚠️  Missing location or arrondissement, skipping');
      skipped++;
      continue;
    }

    // Geocode the address
    const coordinates = await geocodeAddress(door.location, door.arrondissement);

    if (coordinates) {
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('doors')
        .update({ coordinates })
        .eq('id', door.id);

      if (updateError) {
        console.error('  ❌ Error updating door:', updateError);
        failed++;
      } else {
        console.log('  ✅ Successfully updated coordinates');
        updated++;
      }
    } else {
      console.log('  ❌ Failed to geocode address');
      failed++;
    }

    // Respect OpenStreetMap rate limit (1 request per second)
    await delay(1000);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📋 Total: ${doors.length}`);
  console.log('='.repeat(50));
}

// Only run if called directly (not imported)
if (import.meta.url.endsWith('geocodeExistingDoors.ts')) {
  geocodeAllDoors()
    .then(() => {
      console.log('\n✨ Migration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}
