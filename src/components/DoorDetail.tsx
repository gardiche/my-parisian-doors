import { Door } from '@/types/door';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MapPin, Palette, Hammer, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTagColor } from '@/lib/tagColors';

interface DoorDetailProps {
  door: Door;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
}

export function DoorDetail({ door, onBack, onToggleFavorite }: DoorDetailProps) {
  // Extract postal code from arrondissement (e.g., "2nd — Bourse" -> "75002")
  const getPostalCode = (arrondissement: string): string => {
    const match = arrondissement.match(/^(\d+)/);
    if (match) {
      const num = match[1].padStart(2, '0');
      return `750${num}`;
    }
    return '';
  };

  const postalCode = getPostalCode(door.arrondissement);
  const fullAddress = postalCode ? `${door.location}, ${postalCode} Paris` : door.location;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-10 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(door.id)}
            className="gap-2"
          >
            <Heart
              className={cn(
                "w-4 h-4",
                door.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
            {door.isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {/* Hero Image */}
        <div className="relative aspect-[4/5] max-h-[70vh] overflow-hidden">
          <img 
            src={door.imageUrl} 
            alt={`Door at ${door.location}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{door.neighborhood}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{fullAddress}</h1>
          </div>

          {/* Properties */}
          <Card className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Door Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hammer className="w-4 h-4" />
                  Material
                </div>
                <Badge customColor={getTagColor('material', door.material)}>{door.material}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  Color
                </div>
                <Badge customColor={getTagColor('color', door.color)}>{door.color}</Badge>
              </div>
              <div className="space-y-2 col-span-2">
                <div className="text-sm text-muted-foreground">Style</div>
                <Badge customColor={getTagColor('style', door.style)}>{door.style}</Badge>
              </div>
            </div>
          </Card>

          {/* Description */}
          {door.description && (
            <Card className="p-4">
              <h2 className="font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{door.description}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}