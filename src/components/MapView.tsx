import React, { useEffect, useRef } from 'react';
import { Door, DoorMaterial, DoorColor, DoorStyle, DoorArrondissement, DoorOrnamentation } from '@/types/door';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { SearchFilter } from '@/components/SearchFilter';
import { cn } from '@/lib/utils';

// Get color hex value from door color name
const getDoorColorHex = (color: string): string => {
  const colorMap: Record<string, string> = {
    'Green': '#2d5016',
    'Blue': '#1e3a5f',
    'Black': '#1a1a1a',
    'White': '#f5f5f5',
    'Cream': '#f5e6d3',
    'Brown': '#4a2511',
    'Red': '#8b1e1e',
    'Gray': '#6b7280'
  };
  return colorMap[color] || '#4a2511';
};

// Generate Parisian door icon using uploaded SVG files
const generateParisianDoorIcon = (doorColor: string): string => {
  // Map door colors to lowercase for filename
  const colorFileName = doorColor.toLowerCase().replace('/', '-');
  
  return `
    <div class="w-8 h-10 flex items-center justify-center">
      <img src="/door-${colorFileName}.svg" alt="${doorColor} door" style="width: 24px; height: 32px;" />
    </div>
  `;
};

interface MapViewProps {
  doors: Door[];
  onDoorClick: (door: Door) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMaterials: DoorMaterial[];
  selectedColors: DoorColor[];
  selectedStyles: DoorStyle[];
  selectedArrondissements: DoorArrondissement[];
  selectedOrnamentations: DoorOrnamentation[];
  onMaterialToggle: (material: DoorMaterial) => void;
  onColorToggle: (color: DoorColor) => void;
  onStyleToggle: (style: DoorStyle) => void;
  onArrondissementToggle: (arrondissement: DoorArrondissement) => void;
  onOrnamentationToggle: (ornamentation: DoorOrnamentation) => void;
  onClearFilters: () => void;
}

const PARIS_NEIGHBORHOODS = {
  "Montmartre": [48.8867, 2.3431] as [number, number],
  "Le Marais": [48.8566, 2.3622] as [number, number],
  "Saint-Germain": [48.8496, 2.3344] as [number, number],
  "Champs-Élysées": [48.8698, 2.3076] as [number, number],
  "Latin Quarter": [48.8503, 2.3439] as [number, number],
  "Trocadéro": [48.8635, 2.2773] as [number, number],
  "Bastille": [48.8532, 2.3682] as [number, number],
  "Opéra": [48.871, 2.3317] as [number, number],
  "Pigalle": [48.8826, 2.3379] as [number, number],
  "Belleville": [48.8719, 2.3776] as [number, number]
};

const getDoorCoordinates = (door: Door): [number, number] => {
  const baseCoords = PARIS_NEIGHBORHOODS[door.neighborhood as keyof typeof PARIS_NEIGHBORHOODS] || [48.8566, 2.3522];
  const offset = 0.003;
  const lat = baseCoords[0] + (Math.random() - 0.5) * offset;
  const lng = baseCoords[1] + (Math.random() - 0.5) * offset;
  return [lat, lng];
};

export function MapView({ 
  doors, 
  onDoorClick,
  searchTerm,
  onSearchChange,
  selectedMaterials,
  selectedColors,
  selectedStyles,
  selectedArrondissements,
  selectedOrnamentations,
  onMaterialToggle,
  onColorToggle,
  onStyleToggle,
  onArrondissementToggle,
  onOrnamentationToggle,
  onClearFilters
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = React.useState<string | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div class="relative">
              <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div class="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([48.8566, 2.3522], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        const markers: any[] = [];
        doors.forEach((door) => {
          const coords = getDoorCoordinates(door);
          
          const doorIcon = L.divIcon({
            className: 'custom-door-marker',
            html: generateParisianDoorIcon(door.color),
            iconSize: [30, 36],
            iconAnchor: [18, 42],
            popupAnchor: [0, -32]
          });
          
          const marker = L.marker(coords, { icon: doorIcon }).addTo(map);
          
          const popupContent = document.createElement('div');
          popupContent.className = 'door-popup p-0 min-w-[200px]';
          popupContent.innerHTML = `
            <div class="relative">
              <img src="${door.imageUrl}" alt="Door" class="w-full h-32 object-cover rounded-t-lg">
              <div class="absolute top-2 right-2">
                <div class="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                  <svg class="w-4 h-4 ${door.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                  </svg>
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-lg">
                <h3 class="text-white font-semibold text-sm">${door.neighborhood}</h3>
                <p class="text-white/90 text-xs">${door.location}</p>
                <div class="flex gap-1 mt-1">
                  <span class="text-xs bg-white/20 px-2 py-0.5 rounded">${door.style}</span>
                  <span class="text-xs bg-white/20 px-2 py-0.5 rounded">${door.color}</span>
                </div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 200,
            className: 'custom-popup'
          });

          marker.on('click', () => {
            onDoorClick(door);
          });

          markers.push(marker);
        });

        mapInstanceRef.current = map;
        markersRef.current = markers;
        setMapReady(true);

        requestUserLocation(L, map, userIcon);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [doors, onDoorClick]);

  const requestUserLocation = async (L: any, map: any, userIcon: any) => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      const userCoords: [number, number] = [latitude, longitude];
      
      setUserLocation(userCoords);

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userMarker = L.marker(userCoords, { icon: userIcon }).addTo(map);
      userMarker.bindPopup(`
        <div class="text-center p-2">
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span class="font-semibold text-sm">Your position</span>
          </div>
          <p class="text-xs text-gray-600">Latitude: ${latitude.toFixed(6)}</p>
          <p class="text-xs text-gray-600">Longitude: ${longitude.toFixed(6)}</p>
        </div>
      `);
      
      userMarkerRef.current = userMarker;
      
    } catch (error) {
      console.error('Error getting user location:', error);
    } finally {
      setIsLocating(false);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userLocation, 16);
    } else if (mapInstanceRef.current) {
      import('leaflet').then(L => {
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div class="relative">
              <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div class="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        requestUserLocation(L, mapInstanceRef.current!, userIcon);
      });
    }
  };

  const zoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const flyToNeighborhood = (neighborhood: string) => {
    const coords = PARIS_NEIGHBORHOODS[neighborhood as keyof typeof PARIS_NEIGHBORHOODS];
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, 15);
      setSelectedNeighborhood(neighborhood);
    }
  };

  const showAllDoors = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([48.8566, 2.3522], 12);
      setSelectedNeighborhood(null);
    }
  };

  const neighborhoods = Array.from(new Set(doors.map(door => door.neighborhood)));

  return (
    <div className="relative h-screen bg-background">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          padding: 0;
          background: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-door-marker {
          background: transparent;
          border: none;
        }
        .custom-user-marker {
          background: transparent;
          border: none;
        }
      `}</style>

      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="p-3 bg-background/95 backdrop-blur-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Map Filters</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs h-7"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-3">
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                selectedMaterials={selectedMaterials}
                selectedColors={selectedColors}
                selectedStyles={selectedStyles}
                selectedArrondissements={selectedArrondissements}
                selectedOrnamentations={selectedOrnamentations}
                onMaterialToggle={onMaterialToggle}
                onColorToggle={onColorToggle}
                onStyleToggle={onStyleToggle}
                onArrondissementToggle={onArrondissementToggle}
                onOrnamentationToggle={onOrnamentationToggle}
                onClearFilters={onClearFilters}
              />
            </div>
          )}

          {!showFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                size="sm"
                variant={selectedNeighborhood === null ? "default" : "outline"}
                onClick={showAllDoors}
                className="text-xs h-7"
              >
                All Paris
              </Button>
              {neighborhoods.slice(0, 4).map((neighborhood) => (
                <Button
                  key={neighborhood}
                  size="sm"
                  variant={selectedNeighborhood === neighborhood ? "default" : "outline"}
                  onClick={() => flyToNeighborhood(neighborhood)}
                  className="text-xs h-7"
                >
                  {neighborhood}
                </Button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="absolute bottom-36 left-4 z-10 flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={centerOnUser}
          disabled={isLocating}
          className="w-10 h-10 p-0 bg-background/95 backdrop-blur-lg"
          title="My position"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 text-blue-500" />
          )}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomIn}
          className="w-10 h-10 p-0 bg-background/95 backdrop-blur-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomOut}
          className="w-10 h-10 p-0 bg-background/95 backdrop-blur-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      <Card className="absolute bottom-36 left-16 z-10 px-3 py-2 bg-background/95 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {doors.length} door{doors.length !== 1 ? 's' : ''} on map
          </span>
        </div>
      </Card>

      {!mapReady && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading Paris map...</p>
          </Card>
        </div>
      )}
    </div>
  );
}