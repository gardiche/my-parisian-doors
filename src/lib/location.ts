// Location utilities for Paris quartiers and POI detection
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import distance from '@turf/distance';
import parisPoiData from '@/data/paris_pois.json';
import { DoorArrondissement } from '@/types/door';

// Types
interface QuartierInfo {
  name: string;
  code: string;
  arrondissement: string;
  arr_code: number;
}

interface POI {
  name: string;
  lat: number;
  lon: number;
  radius_m: number;
  score: number;
  arr: number;
}

interface LocationInfo {
  quartier: QuartierInfo | null;
  nearestPOI: POI | null;
  distanceToPOI: number | null;
  suggestedNeighborhood: string;
  suggestedArrondissement: DoorArrondissement | null;
}

// Cache for quartiers data
let quartiersCache: any = null;

/**
 * Load Paris quartiers from Open Data API
 */
export async function loadQuartiers(): Promise<any> {
  if (quartiersCache) {
    return quartiersCache;
  }

  try {
    const url = 'https://opendata.paris.fr/api/records/1.0/download/?dataset=quartier_paris&format=geojson';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to download quartiers data');
    }

    quartiersCache = await response.json();
    return quartiersCache;
  } catch (error) {
    console.error('Error loading quartiers:', error);
    return null;
  }
}

/**
 * Find quartier for given coordinates using point-in-polygon
 */
export function findQuartierForLatLon(geojson: any, lat: number, lon: number): QuartierInfo | null {
  if (!geojson || !geojson.features) return null;

  const p = point([lon, lat]); // Note: lon, lat order for GeoJSON

  for (const feature of geojson.features) {
    try {
      if (booleanPointInPolygon(p, feature)) {
        const props = feature.properties || {};
        return {
          name: props.l_qu || 'Unknown',
          code: props.c_qu || '',
          arrondissement: props.l_ar || '',
          arr_code: parseInt(props.c_ar) || 0
        };
      }
    } catch (error) {
      // Skip invalid features
      continue;
    }
  }

  return null;
}

/**
 * Calculate distance between two points in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const from = point([lon1, lat1]);
  const to = point([lon2, lat2]);
  return distance(from, to, { units: 'kilometers' }) * 1000; // Convert to meters
}

/**
 * Find nearest POI within radius
 */
export function findNearestPOI(lat: number, lon: number): { poi: POI | null; distance: number | null } {
  const pois: POI[] = parisPoiData.pois;

  let nearest: POI | null = null;
  let minDistance = Infinity;
  let minDistanceInRadius = Infinity;

  for (const poi of pois) {
    const dist = calculateDistance(lat, lon, poi.lat, poi.lon);

    // Track absolute nearest for fallback
    if (dist < minDistance) {
      minDistance = dist;
      if (!nearest) nearest = poi;
    }

    // Check if within POI radius, prioritize by score
    if (dist <= poi.radius_m) {
      // Use weighted distance (distance / score) to prioritize high-score POIs
      const weightedDist = dist / poi.score;
      if (weightedDist < minDistanceInRadius) {
        minDistanceInRadius = weightedDist;
        nearest = poi;
        minDistance = dist;
      }
    }
  }

  return {
    poi: nearest,
    distance: nearest ? minDistance : null
  };
}

/**
 * Convert arrondissement code to DoorArrondissement type
 */
function arrCodeToArrondissement(arrCode: number): DoorArrondissement | null {
  const mapping: Record<number, DoorArrondissement> = {
    1: '1st — Louvre',
    2: '2nd — Bourse',
    3: '3rd — Le Marais (Temple)',
    4: '4th — Hôtel-de-Ville (Le Marais, Île Saint-Louis)',
    5: '5th — Panthéon (Quartier Latin)',
    6: '6th — Luxembourg (Saint-Germain-des-Prés)',
    7: '7th — Palais-Bourbon (Tour Eiffel, Invalides)',
    8: '8th — Élysée (Champs-Élysées, Madeleine)',
    9: '9th — Opéra (Pigalle Sud)',
    10: '10th — Entrepôt (Canal Saint-Martin)',
    11: '11th — Popincourt (Oberkampf, Bastille)',
    12: '12th — Reuilly (Bercy, Daumesnil)',
    13: '13th — Gobelins (Butte-aux-Cailles, Chinatown)',
    14: '14th — Observatoire (Montparnasse)',
    15: '15th — Vaugirard',
    16: '16th — Passy (Trocadéro, Auteuil)',
    17: '17th — Batignolles-Monceau',
    18: '18th — Montmartre (Butte-Montmartre)',
    19: '19th — Buttes-Chaumont (La Villette)',
    20: '20th — Ménilmontant (Belleville, Père-Lachaise)'
  };

  return mapping[arrCode] || null;
}

/**
 * Get comprehensive location info from GPS coordinates
 */
export async function getLocationInfo(lat: number, lon: number): Promise<LocationInfo> {
  console.log('📍 Getting location info for:', lat, lon);

  // Find nearest POI
  const { poi: nearestPOI, distance: distanceToPOI } = findNearestPOI(lat, lon);
  console.log('  Nearest POI:', nearestPOI?.name, distanceToPOI ? `(${Math.round(distanceToPOI)}m)` : '');

  // Load and find quartier
  const geojson = await loadQuartiers();
  const quartier = geojson ? findQuartierForLatLon(geojson, lat, lon) : null;
  console.log('  Quartier:', quartier?.name, '- Arr:', quartier?.arr_code);

  // Determine suggested neighborhood
  let suggestedNeighborhood = 'Paris';

  if (nearestPOI && distanceToPOI && distanceToPOI <= nearestPOI.radius_m) {
    // Use POI name if within radius
    suggestedNeighborhood = nearestPOI.name;
  } else if (quartier) {
    // Use quartier name as fallback
    suggestedNeighborhood = quartier.name;
  }

  // Determine arrondissement
  let suggestedArrondissement: DoorArrondissement | null = null;

  if (quartier && quartier.arr_code) {
    suggestedArrondissement = arrCodeToArrondissement(quartier.arr_code);
  } else if (nearestPOI) {
    suggestedArrondissement = arrCodeToArrondissement(nearestPOI.arr);
  }

  console.log('  ✅ Suggested:', suggestedNeighborhood, '-', suggestedArrondissement);

  return {
    quartier,
    nearestPOI,
    distanceToPOI,
    suggestedNeighborhood,
    suggestedArrondissement
  };
}
