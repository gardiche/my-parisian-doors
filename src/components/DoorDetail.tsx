import { useState } from 'react';
import { Door } from '@/types/door';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flag, Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTagColor } from '@/lib/tagColors';
import { useAuth } from '@/contexts/AuthContext';

interface DoorDetailProps {
  door: Door;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
}

const COLOR_HEX: Record<string, string> = {
  Green: '#A8C3A1',
  Blue: '#A9C3D1',
  Black: '#3A3A3A',
  White: '#F3EDE7',
  Cream: '#F0DCC2',
  Brown: '#C9A689',
  Red: '#E7A9A1',
  Gray: '#D5D5D5',
};

export function DoorDetail({ door, onBack, onToggleFavorite }: DoorDetailProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [willBeFavorite, setWillBeFavorite] = useState(door.isFavorite);
  const { user } = useAuth();

  const handleFavoriteClick = () => {
    const newState = !door.isFavorite;
    setWillBeFavorite(newState);
    setIsAnimating(true);
    onToggleFavorite(door.id);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleReportDoor = () => {
    const subject = `Report door ${door.id}`;
    const body = [
      'Hello My Parisian Doors team,',
      '',
      'I would like to report this door:',
      `Door ID: ${door.id}`,
      `Location: ${door.location}`,
      `Neighborhood: ${door.neighborhood}`,
      '',
      'Reason:',
      '',
    ].join('\n');

    window.location.href = `mailto:bonjour@myparisiandoors.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getPostalCode = (arrondissement?: string): string => {
    if (!arrondissement) return '';
    const match = arrondissement.match(/^(\d+)/);
    if (match) return `${match[1]}TH`;
    return '';
  };

  const postalCode = getPostalCode(door.arrondissement);
  const addedByName = door.addedBy === 'preset' ? 'Paris Collection' : (user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Anonymous');
  const addedByInitial = addedByName[0]?.toUpperCase() || '?';

  const formattedDate = door.dateAdded
    ? new Date(door.dateAdded).toISOString().split('T')[0]
    : '—';

  const colorSwatch = COLOR_HEX[door.color] || '#D5D5D5';

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Hero Image */}
      <div className="relative w-full overflow-hidden">
        <img
          src={door.imageUrl}
          alt={`Door at ${door.location}`}
          className="w-full object-contain"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Text overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          {(postalCode || door.style) && (
            <p className="text-white/70 text-xs font-medium tracking-widest uppercase mb-1">
              {[postalCode, door.style?.toUpperCase()].filter(Boolean).join(' · ')}
            </p>
          )}
          <h1 className="font-calligraphy text-3xl font-semibold text-white leading-tight mb-2">
            {door.location}
          </h1>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-white/70" />
            <span className="text-white/80 text-sm">{door.neighborhood}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 space-y-5">

        {/* Added by row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-haussmann flex items-center justify-center">
              <span className="text-cream text-xs font-semibold">{addedByInitial}</span>
            </div>
            <span className="text-sm text-charcoal">
              Added by <span className="font-semibold text-night">{addedByName}</span>
            </span>
          </div>
          <button
            onClick={handleFavoriteClick}
            className="flex items-center gap-1.5 group"
          >
            <div className="relative">
              <Heart
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  door.isFavorite ? "fill-red-500 text-red-500" : "text-charcoal group-hover:text-red-400",
                  isAnimating && willBeFavorite && "animate-[heartBeat_0.6s_ease-in-out]",
                  isAnimating && !willBeFavorite && "animate-[heartBreak_0.4s_ease-out]"
                )}
              />
              {isAnimating && willBeFavorite && (
                <div className="absolute inset-0 animate-ping">
                  <Heart className="w-5 h-5 fill-red-400 text-red-400 opacity-75" />
                </div>
              )}
            </div>
          </button>
        </div>

        <button
          onClick={handleReportDoor}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal transition-colors hover:text-brick"
        >
          <Flag className="h-3.5 w-3.5" />
          Report this door
        </button>

        {/* Separator */}
        <div className="h-px bg-stone" />

        {/* Description */}
        {door.description && (
          <p className="text-charcoal text-sm leading-relaxed">
            {door.description}
          </p>
        )}

        {/* Separator */}
        <div className="h-px bg-stone" />

        {/* Details grid */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-charcoal uppercase mb-3">Details</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'MATERIAL', value: door.material },
              { label: 'COLOR', value: door.color },
              { label: 'STYLE', value: door.style },
              { label: 'ADDED', value: formattedDate },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-stone p-3">
                <p className="text-[9px] font-semibold tracking-widest text-charcoal uppercase mb-1">{label}</p>
                <p className="text-sm font-medium text-night">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ornamentations */}
        {door.ornamentations && door.ornamentations.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-charcoal uppercase mb-3">Ornamentations</p>
            <div className="flex flex-wrap gap-2">
              {door.ornamentations.map((o) => (
                <span
                  key={o}
                  className="px-3 py-1.5 rounded-full border border-stone bg-white text-sm text-night"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Color swatch */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-stone px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg shadow-parisian"
              style={{ backgroundColor: colorSwatch }}
            />
            <div>
              <p className="text-sm font-medium text-night">{door.color}</p>
              <p className="text-xs text-charcoal">Door color</p>
            </div>
          </div>
          <button
            onClick={() => {}}
            className="text-xs font-medium text-haussmann"
          >
            Find similar →
          </button>
        </div>

      </div>
    </div>
  );
}
