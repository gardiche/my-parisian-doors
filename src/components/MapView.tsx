import React, { useEffect, useRef } from 'react';
import { Door, DoorMaterial, DoorColor, DoorStyle, DoorArrondissement, DoorOrnamentation } from '@/types/door';
import { Navigation, ZoomIn, ZoomOut, Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { SearchFilter } from '@/components/SearchFilter';
import * as turf from '@turf/turf';

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
  "Belleville": [48.8719, 2.3776] as [number, number],
};

const DOOR_COLOR_HEX: Record<string, string> = {
  Green:  '#5C8A52',
  Blue:   '#4A7FA5',
  Black:  '#2A2A2A',
  White:  '#B0A898',
  Cream:  '#C4A882',
  Brown:  '#8B5E3C',
  Red:    '#B84040',
  Gray:   '#7A7A7A',
};

const AROUND_ME_RADIUS_KM = 1;

const getDoorCoordinates = (door: Door): [number, number] => {
  if (door.coordinates?.lat && door.coordinates?.lng) {
    return [door.coordinates.lat, door.coordinates.lng];
  }
  const base = PARIS_NEIGHBORHOODS[door.neighborhood as keyof typeof PARIS_NEIGHBORHOODS] || [48.8566, 2.3522];
  const offset = 0.003;
  return [base[0] + (Math.random() - 0.5) * offset, base[1] + (Math.random() - 0.5) * offset];
};

const makeMarkerHtml = (door: Door, colorFilterActive: boolean): string => {
  const color = colorFilterActive ? (DOOR_COLOR_HEX[door.color] || '#2E4A62') : '#2E4A62';
  return `
    <div style="
      width:32px;height:32px;
      background:${color};
      border:2.5px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;
    ">
      <svg width="13" height="13" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="1" width="16" height="26" rx="2" fill="white" fill-opacity="0.9"/>
        <rect x="6" y="3" width="7" height="10" rx="1" fill="none" stroke="${color}" stroke-width="1.5"/>
        <rect x="6" y="16" width="7" height="8" rx="1" fill="none" stroke="${color}" stroke-width="1.5"/>
        <circle cx="17" cy="14" r="1.2" fill="${color}"/>
      </svg>
    </div>
  `;
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
  onClearFilters,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [mapReady, setMapReady] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [aroundMeActive, setAroundMeActive] = React.useState(false);

  const totalActiveFilters =
    selectedMaterials.length + selectedColors.length + selectedStyles.length +
    selectedArrondissements.length + selectedOrnamentations.length;

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const init = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        leafletRef.current = L;

        const map = L.map(mapRef.current!, {
          zoomControl: false,
          attributionControl: false,
        }).setView([48.8566, 2.3522], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);

        // Silent geoloc
        try {
          const { getCurrentPosition: getPos } = await import('@/lib/geolocation');
          const pos = await getPos({ maximumAge: 300000, timeout: 8000 });
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          const userIcon = L.divIcon({
            className: '',
            html: `
              <div style="position:relative;width:20px;height:20px;">
                <div style="width:20px;height:20px;background:#2E4A62;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
                <div style="position:absolute;inset:-4px;border:2px solid rgba(46,74,98,0.3);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          userMarkerRef.current = L.marker(coords, { icon: userIcon }).addTo(map);
        } catch {
          // silently ignore
        }
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    init();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Rebuild markers whenever doors or color filter changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapReady) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const colorFilterActive = selectedColors.length > 0;

    doors.forEach((door) => {
      const coords = getDoorCoordinates(door);
      const icon = L.divIcon({
        className: '',
        html: makeMarkerHtml(door, colorFilterActive),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const marker = L.marker(coords, { icon }).addTo(map);
      marker.on('click', () => onDoorClick(door));
      markersRef.current.push(marker);
    });
  }, [doors, selectedColors, onDoorClick, mapReady]);

  // Around me filter
  useEffect(() => {
    if (!mapReady || !markersRef.current.length) return;
    markersRef.current.forEach((marker, i) => {
      const door = doors[i];
      if (!door) return;
      if (aroundMeActive && userLocation) {
        const from = turf.point([userLocation[1], userLocation[0]]);
        const to = turf.point([getDoorCoordinates(door)[1], getDoorCoordinates(door)[0]]);
        const dist = turf.distance(from, to, { units: 'kilometers' });
        dist <= AROUND_ME_RADIUS_KM ? marker.addTo(mapInstanceRef.current) : marker.remove();
      } else {
        marker.addTo(mapInstanceRef.current);
      }
    });
  }, [aroundMeActive, userLocation, mapReady, doors]);

  const visibleCount = aroundMeActive && userLocation
    ? doors.filter(d => {
        const from = turf.point([userLocation[1], userLocation[0]]);
        const to = turf.point([getDoorCoordinates(d)[1], getDoorCoordinates(d)[0]]);
        return turf.distance(from, to, { units: 'kilometers' }) <= AROUND_ME_RADIUS_KM;
      }).length
    : doors.length;

  const centerOnUser = async () => {
    if (userLocation) { mapInstanceRef.current?.flyTo(userLocation, 16); return; }
    setIsLocating(true);
    try {
      const { getCurrentPosition: getPos } = await import('@/lib/geolocation');
      const pos = await getPos({ maximumAge: 0 });
      const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coords);
      mapInstanceRef.current?.flyTo(coords, 16);
    } catch { /* ignore */ }
    finally { setIsLocating(false); }
  };

  const glassStyle: React.CSSProperties = {
    background: 'rgba(250, 247, 242, 0.88)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(229, 227, 223, 0.8)',
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      <style>{`
        .leaflet-container { background: #f0ebe3; }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative" style={{ ...glassStyle, borderRadius: 999, overflow: 'hidden' }}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/50" />
            <input
              type="text"
              placeholder="Search by street, style..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-night placeholder:text-charcoal/50 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-full relative flex-shrink-0"
            style={glassStyle}
          >
            <SlidersHorizontal className="w-4 h-4 text-night" />
            {totalActiveFilters > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-haussmann text-cream text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalActiveFilters}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="rounded-2xl overflow-hidden overflow-y-auto max-h-[60vh]" style={glassStyle}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-xs font-semibold tracking-widest text-charcoal uppercase">Filters</span>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4 text-charcoal" />
              </button>
            </div>
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

        {/* Active color legend */}
        {selectedColors.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedColors.map(c => (
              <div
                key={c}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ ...glassStyle, borderRadius: 999 }}
              >
                <div
                  className="w-3 h-3 rounded-full border border-white/50"
                  style={{ background: DOOR_COLOR_HEX[c] || '#2E4A62' }}
                />
                <span className="text-xs font-medium text-night">{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute right-4 bottom-40 z-10 flex flex-col gap-2">
        <button onClick={() => mapInstanceRef.current?.zoomIn()} className="w-10 h-10 flex items-center justify-center rounded-full" style={glassStyle}>
          <ZoomIn className="w-4 h-4 text-night" />
        </button>
        <button onClick={() => mapInstanceRef.current?.zoomOut()} className="w-10 h-10 flex items-center justify-center rounded-full" style={glassStyle}>
          <ZoomOut className="w-4 h-4 text-night" />
        </button>
      </div>

      {/* Bottom pill row */}
      <div className="absolute bottom-24 left-0 right-0 z-10 flex items-center justify-center gap-2 px-4">
        <div className="px-4 py-2 rounded-full flex items-center gap-2" style={glassStyle}>
          <div className="w-1.5 h-1.5 rounded-full bg-haussmann" />
          <span className="text-xs font-medium text-night">
            {visibleCount} door{visibleCount !== 1 ? 's' : ''}
            {aroundMeActive ? ` · within ${AROUND_ME_RADIUS_KM}km` : ' · Paris'}
          </span>
        </div>

        <button
          onClick={() => {
            if (!aroundMeActive) { setAroundMeActive(true); centerOnUser(); }
            else { setAroundMeActive(false); mapInstanceRef.current?.setView([48.8566, 2.3522], 13); }
          }}
          className="px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200"
          style={aroundMeActive ? { background: '#2E4A62', border: '1px solid #2E4A62' } : glassStyle}
        >
          {isLocating
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: aroundMeActive ? 'white' : '#2E4A62' }} />
            : <Navigation className="w-3.5 h-3.5" style={{ color: aroundMeActive ? 'white' : '#2E4A62' }} />
          }
          <span className="text-xs font-medium" style={{ color: aroundMeActive ? 'white' : '#1C1C1C' }}>Near me</span>
        </button>

        <button onClick={centerOnUser} className="w-9 h-9 flex items-center justify-center rounded-full" style={glassStyle}>
          <Navigation className="w-3.5 h-3.5 text-haussmann" />
        </button>
      </div>

      {/* Loading */}
      {!mapReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: '#F5F0E8' }}>
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-haussmann border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-charcoal">Loading Paris map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
