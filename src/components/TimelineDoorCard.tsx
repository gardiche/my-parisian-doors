// src/components/TimelineDoorCard.tsx
import React from 'react';
import { Door } from '@/types/door';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Clock, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineDoorCardProps {
  door: Door;
  onToggleFavorite: (id: string) => void;
  onCardClick: (door: Door) => void;
  timeAgo?: string;
  isFirst?: boolean;
}

export function TimelineDoorCard({ 
  door, 
  onToggleFavorite, 
  onCardClick, 
  timeAgo,
  isFirst = false 
}: TimelineDoorCardProps) {
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg bg-card/95 backdrop-blur-sm overflow-hidden",
        isFirst && "ring-2 ring-primary/20 shadow-lg"
      )}
      onClick={() => onCardClick(door)}
    >
      <div className="flex gap-3 p-4">
        {/* Image */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
            <img 
              src={door.imageUrl} 
              alt={`Door at ${door.location}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          
          {/* New badge for first item */}
          {isFirst && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {door.location}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{door.neighborhood}</span>
              </div>
            </div>
            
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(door.id);
              }}
              className="p-1 rounded-full hover:bg-muted/50 transition-colors flex-shrink-0 ml-2"
            >
              <Heart 
                className={cn(
                  "w-4 h-4 transition-colors",
                  door.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-foreground"
                )} 
              />
            </button>
          </div>

          {/* Properties */}
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="secondary" className="text-xs px-2 py-0">
              {door.material}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0">
              {door.color}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0">
              {door.style}
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span>Photo ajoutée</span>
            </div>
            {timeAgo && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}