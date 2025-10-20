// src/components/SearchFilter.tsx
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { DoorMaterial, DoorColor, DoorStyle, DoorArrondissement, DoorOrnamentation } from '@/types/door';

interface SearchFilterProps {
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

const materials: DoorMaterial[] = ['Wood', 'Metal', 'Glass', 'Stone', 'Composite'];
const colors: DoorColor[] = ['Green', 'Blue', 'Black', 'White', 'Cream', 'Brown', 'Red', 'Gray'];
const styles: DoorStyle[] = ['Haussmann', 'Art Nouveau', 'Modern', 'Vintage', 'Industrial', 'Classic'];
const arrondissements: DoorArrondissement[] = [
  '1st — Louvre',
  '2nd — Bourse',
  '3rd — Le Marais (Temple)',
  '4th — Hôtel-de-Ville (Le Marais, Île Saint-Louis)',
  '5th — Panthéon (Quartier Latin)',
  '6th — Luxembourg (Saint-Germain-des-Prés)',
  '7th — Palais-Bourbon (Tour Eiffel, Invalides)',
  '8th — Élysée (Champs-Élysées, Madeleine)',
  '9th — Opéra (Pigalle Sud)',
  '10th — Entrepôt (Canal Saint-Martin)',
  '11th — Popincourt (Oberkampf, Bastille)',
  '12th — Reuilly (Bercy, Daumesnil)',
  '13th — Gobelins (Butte-aux-Cailles, Chinatown)',
  '14th — Observatoire (Montparnasse)',
  '15th — Vaugirard',
  '16th — Passy (Trocadéro, Auteuil)',
  '17th — Batignolles-Monceau',
  '18th — Montmartre (Butte-Montmartre)',
  '19th — Buttes-Chaumont (La Villette)',
  '20th — Ménilmontant (Belleville, Père-Lachaise)'
];
const ornamentations: DoorOrnamentation[] = ['Ironwork', 'Stained Glass', 'Wood Carving', 'Columns', 'Pediment', 'Door Knocker', 'Moldings', 'Flowers'];

export function SearchFilter({
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
}: SearchFilterProps) {
  const hasActiveFilters = selectedMaterials.length > 0 || selectedColors.length > 0 || selectedStyles.length > 0 || selectedArrondissements.length > 0 || selectedOrnamentations.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by location or neighborhood..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {selectedMaterials.length + selectedColors.length + selectedStyles.length + selectedArrondissements.length + selectedOrnamentations.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4 max-h-96 overflow-y-auto" align="start">
            <div className="space-y-4">
              {/* Materials */}
              <div>
                <h4 className="font-medium mb-2">Material</h4>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material) => (
                    <Badge
                      key={material}
                      variant={selectedMaterials.includes(material) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onMaterialToggle(material)}
                    >
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Colors */}
              <div>
                <h4 className="font-medium mb-2">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <Badge
                      key={color}
                      variant={selectedColors.includes(color) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onColorToggle(color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Styles */}
              <div>
                <h4 className="font-medium mb-2">Style</h4>
                <div className="flex flex-wrap gap-2">
                  {styles.map((style) => (
                    <Badge
                      key={style}
                      variant={selectedStyles.includes(style) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onStyleToggle(style)}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Arrondissements */}
              <div>
                <h4 className="font-medium mb-2">Arrondissement</h4>
                <div className="grid grid-cols-4 gap-2">
                  {arrondissements.map((arr) => (
                    <Badge
                      key={arr}
                      variant={selectedArrondissements.includes(arr) ? "default" : "outline"}
                      className="cursor-pointer text-center justify-center"
                      onClick={() => onArrondissementToggle(arr)}
                    >
                      {arr}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ornamentations */}
              <div>
                <h4 className="font-medium mb-2">Ornamentation</h4>
                <div className="flex flex-wrap gap-2">
                  {ornamentations.map((ornamentation) => (
                    <Badge
                      key={ornamentation}
                      variant={selectedOrnamentations.includes(ornamentation) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onOrnamentationToggle(ornamentation)}
                    >
                      {ornamentation}
                    </Badge>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <>
                  <Separator />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onClearFilters}
                    className="w-full gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedMaterials.map((material) => (
              <Badge key={`material-${material}`} variant="secondary" className="gap-1">
                {material}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onMaterialToggle(material)}
                />
              </Badge>
            ))}
            {selectedColors.map((color) => (
              <Badge key={`color-${color}`} variant="secondary" className="gap-1">
                {color}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onColorToggle(color)}
                />
              </Badge>
            ))}
            {selectedStyles.map((style) => (
              <Badge key={`style-${style}`} variant="secondary" className="gap-1">
                {style}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onStyleToggle(style)}
                />
              </Badge>
            ))}
            {selectedArrondissements.map((arr) => (
              <Badge key={`arr-${arr}`} variant="secondary" className="gap-1">
                {arr}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onArrondissementToggle(arr)}
                />
              </Badge>
            ))}
            {selectedOrnamentations.map((ornamentation) => (
              <Badge key={`ornamentation-${ornamentation}`} variant="secondary" className="gap-1">
                {ornamentation}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onOrnamentationToggle(ornamentation)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}