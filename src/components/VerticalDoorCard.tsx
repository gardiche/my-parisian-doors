import React, { useState } from 'react';
import { Door } from '@/types/door';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTagColor } from '@/lib/tagColors';
import { useUserLocation, formatDistance } from '@/hooks/useUserLocation';

interface VerticalDoorCardProps {
  door: Door;
  onToggleFavorite?: (id: string) => void;
  onCardClick?: (door: Door) => void;
}

export const VerticalDoorCard: React.FC<VerticalDoorCardProps> = ({
  door,
  onToggleFavorite,
  onCardClick
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [willBeFavorite, setWillBeFavorite] = useState(door.isFavorite);
  const userLocation = useUserLocation();

  const distance = userLocation && door.coordinates
    ? formatDistance(userLocation.lat, userLocation.lng, door.coordinates.lat, door.coordinates.lng)
    : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !door.isFavorite;
    setWillBeFavorite(newState);
    setIsAnimating(true);
    onToggleFavorite?.(door.id);

    // Reset animation after it completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-parisian-xl bg-cream/90 backdrop-blur-sm border-stone overflow-hidden animate-fade-in"
      onClick={() => onCardClick?.(door)}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone">
        <img
          src={door.imageUrl}
          alt={`Door in ${door.neighborhood}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-night/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Distance — top left */}
        {distance && (
          <div className="absolute top-2.5 left-2.5 bg-haussmann/40 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20">
            <span className="text-[10px] font-medium text-white">{distance}</span>
          </div>
        )}

        {/* Like button — top right, always visible */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-90 border border-white/30"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 transition-all duration-300",
                door.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-white",
                isAnimating && willBeFavorite && "animate-[heartBeat_0.6s_ease-in-out]",
                isAnimating && !willBeFavorite && "animate-[heartBreak_0.4s_ease-out]"
              )}
            />
            {isAnimating && willBeFavorite && (
              <div className="absolute inset-0 rounded-full animate-ping bg-red-200/40" />
            )}
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 bg-cream">
        <h3 className="font-display font-semibold text-night text-sm mb-1 truncate">
          {door.neighborhood}
        </h3>

        <div className="flex flex-wrap gap-1">
          <Badge customColor={getTagColor('color', door.color)} className="text-[10px] px-1.5 py-0.5">
            {door.color}
          </Badge>
          <Badge customColor={getTagColor('material', door.material)} className="text-[10px] px-1.5 py-0.5">
            {door.material}
          </Badge>
          <Badge customColor={getTagColor('style', door.style)} className="text-[10px] px-1.5 py-0.5">
            {door.style}
          </Badge>
          {door.ornamentations && door.ornamentations.length > 0 && (
            door.ornamentations.slice(0, 2).map((ornament, idx) => (
              <Badge key={idx} customColor={getTagColor('ornament', ornament)} className="text-[10px] px-1.5 py-0.5">
                {ornament}
              </Badge>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};
