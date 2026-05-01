import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { DoorMaterial, DoorColor, DoorStyle, DoorArrondissement, DoorOrnamentation } from '@/types/door';
import { cn } from '@/lib/utils';

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
  '1st — Louvre', '2nd — Bourse', '3rd — Le Marais (Temple)',
  '4th — Hôtel-de-Ville (Le Marais, Île Saint-Louis)', '5th — Panthéon (Quartier Latin)',
  '6th — Luxembourg (Saint-Germain-des-Prés)', '7th — Palais-Bourbon (Tour Eiffel, Invalides)',
  '8th — Élysée (Champs-Élysées, Madeleine)', '9th — Opéra (Pigalle Sud)',
  '10th — Entrepôt (Canal Saint-Martin)', '11th — Popincourt (Oberkampf, Bastille)',
  '12th — Reuilly (Bercy, Daumesnil)', '13th — Gobelins (Butte-aux-Cailles, Chinatown)',
  '14th — Observatoire (Montparnasse)', '15th — Vaugirard',
  '16th — Passy (Trocadéro, Auteuil)', '17th — Batignolles-Monceau',
  '18th — Montmartre (Butte-Montmartre)', '19th — Buttes-Chaumont (La Villette)',
  '20th — Ménilmontant (Belleville, Père-Lachaise)'
];
const ornamentations: DoorOrnamentation[] = ['Ironwork', 'Stained Glass', 'Wood Carving', 'Columns', 'Pediment', 'Door Knocker', 'Moldings', 'Flowers', 'Golden Details'];

interface FilterSectionProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  activeCount: number;
  children: React.ReactNode;
}

function FilterSection({ label, isOpen, onToggle, activeCount, children }: FilterSectionProps) {
  return (
    <div className="border-b border-stone">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-5"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest text-charcoal uppercase">{label}</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-haussmann text-cream text-[9px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-charcoal transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-96 pb-4' : 'max-h-0'
      )}>
        <div className="px-5">
          {children}
        </div>
      </div>
    </div>
  );
}

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
  onClearFilters,
}: SearchFilterProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (section: string) =>
    setOpenSection(prev => prev === section ? null : section);

  const pillClass = (active: boolean) => cn(
    'px-3 py-1.5 rounded-full text-sm border transition-all duration-150 cursor-pointer',
    active
      ? 'bg-night text-cream border-night'
      : 'bg-cream text-charcoal border-stone hover:border-haussmann hover:text-haussmann'
  );

  return (
    <div>
      {/* Search bar */}
      <div className="px-5 pb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/50" />
          <input
            type="text"
            placeholder="Search by street, style, color..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-white border border-stone rounded-full pl-10 pr-4 py-2.5 text-sm text-night placeholder:text-charcoal/50 focus:outline-none focus:border-haussmann transition-colors"
          />
        </div>
      </div>

      {/* Filter sections */}
      <FilterSection label="Style" isOpen={openSection === 'style'} onToggle={() => toggle('style')} activeCount={selectedStyles.length}>
        <div className="flex flex-wrap gap-2">
          {styles.map(s => (
            <button key={s} onClick={() => onStyleToggle(s)} className={pillClass(selectedStyles.includes(s))}>{s}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Material" isOpen={openSection === 'material'} onToggle={() => toggle('material')} activeCount={selectedMaterials.length}>
        <div className="flex flex-wrap gap-2">
          {materials.map(m => (
            <button key={m} onClick={() => onMaterialToggle(m)} className={pillClass(selectedMaterials.includes(m))}>{m}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Color" isOpen={openSection === 'color'} onToggle={() => toggle('color')} activeCount={selectedColors.length}>
        <div className="flex flex-wrap gap-2">
          {colors.map(c => (
            <button key={c} onClick={() => onColorToggle(c)} className={pillClass(selectedColors.includes(c))}>{c}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Arrondissement" isOpen={openSection === 'arrondissement'} onToggle={() => toggle('arrondissement')} activeCount={selectedArrondissements.length}>
        <div className="flex flex-wrap gap-2">
          {arrondissements.map(a => (
            <button key={a} onClick={() => onArrondissementToggle(a)} className={pillClass(selectedArrondissements.includes(a))}>
              {a.match(/^(\d+)/)?.[1] + 'e'}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Ornamentation" isOpen={openSection === 'ornamentation'} onToggle={() => toggle('ornamentation')} activeCount={selectedOrnamentations.length}>
        <div className="flex flex-wrap gap-2">
          {ornamentations.map(o => (
            <button key={o} onClick={() => onOrnamentationToggle(o)} className={pillClass(selectedOrnamentations.includes(o))}>{o}</button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
