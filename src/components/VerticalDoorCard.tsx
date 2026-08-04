import React, { useState } from 'react';
import { Door } from '@/types/door';
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
  const [imgLoaded, setImgLoaded] = useState(false);
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
    setTimeout(() => setIsAnimating(false), 600);
  };

  type TagCategory = 'style' | 'material' | 'color' | 'ornament';
  const tags: { label: string; category: TagCategory }[] = [
    { label: door.style, category: 'style' },
    { label: door.material, category: 'material' },
    { label: door.color, category: 'color' },
    ...(door.ornamentations?.slice(0, 2).map(o => ({ label: o, category: 'ornament' as TagCategory })) || []),
  ];

  return (
    <div
      className="group relative cursor-pointer rounded-2xl overflow-hidden animate-fade-in"
      onClick={() => onCardClick?.(door)}
    >
      {/* Image — full bleed */}
      <div className="relative w-full aspect-[3/4] bg-stone">
        <img
          src={door.imageUrl}
          alt={`Door in ${door.neighborhood}`}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            "group-hover:scale-105"
          )}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Gradient overlay — bottom heavy */}
        <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/20 to-transparent" />

        {/* Distance — top left */}
        {distance && (
          <div className="absolute top-2.5 left-2.5 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-0.5 border border-white/15">
            <span className="text-[10px] font-medium text-white">{distance}</span>
          </div>
        )}

        {/* Heart — top right */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-90 border border-white/20 bg-white/15 backdrop-blur-md"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-300",
                door.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-white/90",
                isAnimating && willBeFavorite && "animate-[heartBeat_0.6s_ease-in-out]",
                isAnimating && !willBeFavorite && "animate-[heartBreak_0.4s_ease-out]"
              )}
            />
            {isAnimating && willBeFavorite && (
              <div className="absolute inset-0 rounded-full animate-ping bg-red-200/30" />
            )}
          </button>
        )}

        {/* Info overlay — bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8">
          {/* Neighborhood */}
          <h3 className="font-display font-semibold text-white text-sm leading-tight mb-0.5 truncate">
            {door.neighborhood}
          </h3>

          {/* Street */}
          <p className="text-white/60 text-[10px] mb-2 truncate">
            {door.location}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => {
              if (tag.category === 'color') {
                const hex = getTagColor('color', tag.label);
                return (
                  <span
                    key={tag.label}
                    className="px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 text-[9px] font-medium"
                    style={{
                      backgroundColor: `${hex}55`,
                      color: '#FFFFFF',
                    }}
                  >
                    {tag.label}
                  </span>
                );
              }
              return (
                <span
                  key={tag.label}
                  className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 text-[9px] font-medium text-white/85"
                >
                  {tag.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
