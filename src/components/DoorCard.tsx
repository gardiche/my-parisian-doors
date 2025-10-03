// Updated MasonryDoorCard component with Parisian UI
import React from 'react';
import { Door } from '@/types/door';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MasonryDoorCardProps {
  door: Door;
  onToggleFavorite: (id: string) => void;
  onCardClick: (door: Door) => void;
  height: number;
}

export const MasonryDoorCard: React.FC<MasonryDoorCardProps> = ({
  door,
  onToggleFavorite,
  onCardClick,
  height
}) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-parisian-xl hover:scale-[1.02] bg-cream/90 backdrop-blur-sm border-stone overflow-hidden animate-fade-in"
      onClick={() => onCardClick(door)}
      style={{ height: `${height}px` }}
    >
      {/* Image Section */}
      <div className="relative w-full h-3/4 overflow-hidden bg-stone">
        <img 
          src={door.imageUrl} 
          alt={`Door in ${door.neighborhood}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-night/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite heart */}
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
      </div>

      {/* Info Section */}
      <div className="p-4 h-1/4 flex flex-col justify-between bg-cream">
        {/* Neighborhood */}
        <h3 className="font-display font-semibold text-night text-sm mb-2 truncate">
          {door.neighborhood}
        </h3>
        
        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          <Badge 
            variant="color"
            className="text-xs px-2 py-1"
          >
            {door.color}
          </Badge>
          <Badge 
            variant="material" 
            className="text-xs px-2 py-1"
          >
            {door.material}
          </Badge>
        </div>
      </div>
    </Card>
  );
};