// Admin panel component for maintenance tasks
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DoorArrondissement } from '@/types/door';
import { getLocationInfo } from '@/lib/location';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const geocodeAddress = async (address: string, arrondissement: DoorArrondissement): Promise<{lat: number, lng: number, locationInfo?: any} | null> => {
  try {
    // Normalize address: trim spaces, normalize multiple spaces
    const normalizedAddress = address.trim().replace(/\s+/g, ' ');

    const postalCode = arrondissement.match(/^(\d+)/)?.[1];
    const fullPostalCode = postalCode ? `750${postalCode.padStart(2, '0')}` : '75001';

    // Try multiple address formats for better geocoding success
    const addressVariants = [
      `${normalizedAddress}, ${fullPostalCode}, Paris, France`,
      `${normalizedAddress}, Paris ${fullPostalCode}, France`,
      `${normalizedAddress}, Paris, France`,
      `${normalizedAddress}, ${fullPostalCode}`
    ];

    for (const fullAddress of addressVariants) {
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

          // Get intelligent location info (POI + quartier)
          const locationInfo = await getLocationInfo(coords.lat, coords.lng);

          return {
            ...coords,
            locationInfo
          };
        }
      }

      // Wait a bit between format attempts
      await delay(300);
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
  }
  return null;
};

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isUpdatingNeighborhoods, setIsUpdatingNeighborhoods] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState({ updated: 0, skipped: 0, failed: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const geocodeAllDoors = async () => {
    setIsGeocoding(true);
    setLogs([]);
    setResults({ updated: 0, skipped: 0, failed: 0 });

    addLog('🚀 Starting geocoding migration...');

    try {
      // Fetch all doors
      const { data: doors, error } = await supabase
        .from('doors')
        .select('*');

      if (error) {
        addLog(`❌ Error fetching doors: ${error.message}`);
        return;
      }

      if (!doors || doors.length === 0) {
        addLog('No doors found in database');
        return;
      }

      addLog(`Found ${doors.length} doors to process\n`);
      setProgress({ current: 0, total: doors.length });

      let updated = 0;
      let skipped = 0;
      let failed = 0;

      for (let i = 0; i < doors.length; i++) {
        const door = doors[i];
        setProgress({ current: i + 1, total: doors.length });

        addLog(`\n📍 [${i + 1}/${doors.length}] ${door.location || 'NO LOCATION'}`);
        addLog(`  📋 Coordinates: ${door.coordinates ? JSON.stringify(door.coordinates) : 'NULL'}`);
        addLog(`  📋 Arrondissement: ${door.arrondissement || 'MISSING'}`);

        // Skip if already has valid coordinates
        if (door.coordinates && door.coordinates.lat && door.coordinates.lng) {
          addLog('  ⏭️  Already has coordinates, skipping');
          skipped++;
          continue;
        }

        if (!door.location || !door.arrondissement) {
          addLog('  ⚠️  Missing location or arrondissement, skipping');
          addLog(`  ⚠️  Location: "${door.location || 'EMPTY'}", Arrondissement: "${door.arrondissement || 'EMPTY'}"`);
          skipped++;
          continue;
        }

        // Geocode the address
        const geocodeResult = await geocodeAddress(door.location, door.arrondissement);

        if (geocodeResult) {
          const coords = { lat: geocodeResult.lat, lng: geocodeResult.lng };

          // Prepare update data
          const updateData: any = { coordinates: coords };

          // Add intelligent location info if available
          if (geocodeResult.locationInfo) {
            updateData.neighborhood = geocodeResult.locationInfo.suggestedNeighborhood;
            addLog(`  🎯 POI: ${geocodeResult.locationInfo.suggestedNeighborhood}`);
          }

          addLog(`  💾 Saving to Supabase...`);
          addLog(`  💾 Door ID: ${door.id}`);
          addLog(`  💾 Update data: ${JSON.stringify(updateData)}`);

          // Update in Supabase
          const { data: resultData, error: updateError } = await supabase
            .from('doors')
            .update(updateData)
            .eq('id', door.id)
            .select();

          if (updateError) {
            addLog(`  ❌ Supabase Error: ${updateError.message}`);
            addLog(`  ❌ Error details: ${JSON.stringify(updateError)}`);
            failed++;
          } else if (!resultData || resultData.length === 0) {
            addLog(`  ⚠️  WARNING: Update returned no data (door may not exist or no changes)`);
            addLog(`  ⚠️  Result: ${JSON.stringify(resultData)}`);
            failed++;
          } else {
            addLog(`  ✅ Supabase confirmed update!`);
            addLog(`  ✅ New data: ${JSON.stringify(resultData[0])}`);
            updated++;
          }
        } else {
          addLog('  ❌ Failed to geocode address');
          failed++;
        }

        setResults({ updated, skipped, failed });

        // Respect OpenStreetMap rate limit (1 request per second)
        await delay(1000);
      }

      addLog('\n' + '='.repeat(50));
      addLog('📊 Migration Summary:');
      addLog(`  ✅ Updated: ${updated}`);
      addLog(`  ⏭️  Skipped: ${skipped}`);
      addLog(`  ❌ Failed: ${failed}`);
      addLog(`  📋 Total: ${doors.length}`);
      addLog('='.repeat(50));
      addLog('\n✨ Migration complete!');

    } catch (error) {
      addLog(`\n💥 Migration failed: ${error}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const updateAllNeighborhoods = async () => {
    setIsUpdatingNeighborhoods(true);
    setLogs([]);
    setResults({ updated: 0, skipped: 0, failed: 0 });

    addLog('🏘️  Starting neighborhood update...');

    try {
      // Fetch all doors that have coordinates
      const { data: doors, error } = await supabase
        .from('doors')
        .select('*')
        .not('coordinates', 'is', null);

      if (error) {
        addLog(`❌ Error fetching doors: ${error.message}`);
        return;
      }

      if (!doors || doors.length === 0) {
        addLog('No doors with coordinates found in database');
        return;
      }

      addLog(`Found ${doors.length} doors with coordinates to update\n`);
      setProgress({ current: 0, total: doors.length });

      let updated = 0;
      let skipped = 0;
      let failed = 0;

      for (let i = 0; i < doors.length; i++) {
        const door = doors[i];
        setProgress({ current: i + 1, total: doors.length });

        addLog(`\n🏘️  [${i + 1}/${doors.length}] ${door.location || 'NO LOCATION'}`);

        // Check if has valid coordinates
        if (!door.coordinates || !door.coordinates.lat || !door.coordinates.lng) {
          addLog('  ⏭️  No coordinates, skipping');
          skipped++;
          continue;
        }

        addLog(`  📍 GPS: ${door.coordinates.lat}, ${door.coordinates.lng}`);
        addLog(`  📋 Current neighborhood: "${door.neighborhood}"`);

        try {
          // Get intelligent location info using existing coordinates
          const locationInfo = await getLocationInfo(door.coordinates.lat, door.coordinates.lng);

          if (locationInfo && locationInfo.suggestedNeighborhood) {
            const newNeighborhood = locationInfo.suggestedNeighborhood;

            addLog(`  🎯 New POI neighborhood: "${newNeighborhood}"`);

            // Only update if neighborhood has changed
            if (door.neighborhood === newNeighborhood) {
              addLog('  ⏭️  Neighborhood unchanged, skipping');
              skipped++;
              continue;
            }

            // Update in Supabase
            const { data: resultData, error: updateError } = await supabase
              .from('doors')
              .update({ neighborhood: newNeighborhood })
              .eq('id', door.id)
              .select();

            if (updateError) {
              addLog(`  ❌ Supabase Error: ${updateError.message}`);
              failed++;
            } else if (!resultData || resultData.length === 0) {
              addLog(`  ⚠️  WARNING: Update returned no data`);
              failed++;
            } else {
              addLog(`  ✅ Updated: "${door.neighborhood}" → "${newNeighborhood}"`);
              updated++;
            }
          } else {
            addLog('  ⚠️  Could not determine POI neighborhood');
            skipped++;
          }
        } catch (error) {
          addLog(`  ❌ Error: ${error}`);
          failed++;
        }

        setResults({ updated, skipped, failed });

        // Small delay to avoid overwhelming the system
        await delay(100);
      }

      addLog('\n' + '='.repeat(50));
      addLog('📊 Update Summary:');
      addLog(`  ✅ Updated: ${updated}`);
      addLog(`  ⏭️  Skipped: ${skipped}`);
      addLog(`  ❌ Failed: ${failed}`);
      addLog(`  📋 Total: ${doors.length}`);
      addLog('='.repeat(50));
      addLog('\n✨ Update complete!');

    } catch (error) {
      addLog(`\n💥 Update failed: ${error}`);
    } finally {
      setIsUpdatingNeighborhoods(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Admin Panel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Geocoding Section */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  Geocode All Doors
                </h3>
                <p className="text-sm text-muted-foreground">
                  Update GPS coordinates for all existing doors based on their addresses.
                  This process respects OpenStreetMap rate limits (1 request/second).
                </p>
              </div>
            </div>

            <Button
              onClick={geocodeAllDoors}
              disabled={isGeocoding}
              className="w-full gap-2"
            >
              {isGeocoding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Geocoding... {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Start Geocoding
                </>
              )}
            </Button>

            {/* Progress */}
            {isGeocoding && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progress.current}/{progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-semibold text-green-600">{results.updated}</div>
                    <div className="text-xs text-green-600">Updated</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-600">{results.skipped}</div>
                    <div className="text-xs text-gray-600">Skipped</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-semibold text-red-600">{results.failed}</div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Logs */}
            {logs.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Logs:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Update Neighborhoods Section */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  🏘️ Update Neighborhoods with POI
                </h3>
                <p className="text-sm text-muted-foreground">
                  Update neighborhood tags for doors that already have GPS coordinates.
                  Uses the intelligent POI system to find the closest landmark.
                  This is faster than geocoding as it only updates neighborhoods.
                </p>
              </div>
            </div>

            <Button
              onClick={updateAllNeighborhoods}
              disabled={isUpdatingNeighborhoods || isGeocoding}
              className="w-full gap-2"
              variant="secondary"
            >
              {isUpdatingNeighborhoods ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating... {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  🏘️ Update Neighborhoods
                </>
              )}
            </Button>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isGeocoding || isUpdatingNeighborhoods}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
