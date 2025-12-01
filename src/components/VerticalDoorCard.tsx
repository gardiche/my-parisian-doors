import React from 'react';
import { Door } from '@/types/door';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTagColor } from '@/lib/tagColors';

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

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(door.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-lg bg-cream/90 backdrop-blur-sm shadow-parisian transition-all duration-200 hover:bg-cream hover:scale-110 opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                door.isFavorite ? "fill-brick text-brick" : "text-charcoal hover:text-brick"
              )}
            />
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
