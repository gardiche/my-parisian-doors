// src/pages/Index.tsx - Supabase Version
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Door, DoorMaterial, DoorColor, DoorStyle, DoorArrondissement, DoorOrnamentation } from '@/types/door';
import { fetchAllDoors, addDoor, toggleFavoriteDoor } from '@/lib/supabase';
import { DoorDetail } from '@/components/DoorDetail';
import { MapView } from '@/components/MapView';
import { Navigation } from '@/components/Navigation';
import { SearchFilter } from '@/components/SearchFilter';
import { AddDoorForm } from '@/components/AddDoorForm';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Vertical Feed Door Card Component - Instagram Style
interface VerticalDoorCardProps {
  door: Door;
  onToggleFavorite: (id: string) => void;
  onCardClick: (door: Door) => void;
}

const VerticalDoorCard: React.FC<VerticalDoorCardProps> = ({
  door,
  onToggleFavorite,
  onCardClick
}) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-parisian-xl bg-cream/90 backdrop-blur-sm border-stone overflow-hidden animate-fade-in"
      onClick={() => onCardClick(door)}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone">
        <img 
          src={door.imageUrl} 
          alt={`Door in ${door.neighborhood}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-night/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
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
      <div className="p-3 bg-cream">
        <h3 className="font-display font-semibold text-night text-sm mb-1 truncate">
          {door.neighborhood}
        </h3>
        
        <div className="flex gap-1">
          <Badge variant="color" className="text-xs px-2 py-0.5">
            {door.color}
          </Badge>
          <Badge variant="material" className="text-xs px-2 py-0.5">
            {door.material}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

// Masonry Layout Component
interface MasonryLayoutProps {
  doors: Door[];
  onDoorClick: (door: Door) => void;
  onToggleFavorite: (id: string) => void;
}

const MasonryLayout: React.FC<MasonryLayoutProps> = ({
  doors,
  onDoorClick,
  onToggleFavorite
}) => {
  const [loadedItems, setLoadedItems] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (isLoading || loadedItems >= doors.length) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setLoadedItems(prev => Math.min(prev + 10, doors.length));
      setIsLoading(false);
    }, 500);
  }, [doors.length, isLoading, loadedItems]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  const visibleDoors = doors.slice(0, loadedItems);

  return (
    <div className="px-4 pb-6">
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
        {visibleDoors.map((door, index) => (
          <div
            key={door.id}
            className={cn(
              "transition-all duration-300",
              index % 2 === 1 && "mt-6"
            )}
          >
            <VerticalDoorCard
              door={door}
              onToggleFavorite={onToggleFavorite}
              onCardClick={onDoorClick}
            />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      )}

      <div ref={loadMoreRef} className="h-4" />
      
      {!isLoading && loadedItems >= doors.length && doors.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">You've seen it all!</p>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  // State management
  const [doors, setDoors] = useState<Door[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isAddDoorOpen, setIsAddDoorOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<DoorMaterial[]>([]);
  const [selectedColors, setSelectedColors] = useState<DoorColor[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<DoorStyle[]>([]);
  const [selectedArrondissements, setSelectedArrondissements] = useState<DoorArrondissement[]>([]);
  const [selectedOrnamentations, setSelectedOrnamentations] = useState<DoorOrnamentation[]>([]);

  // Load doors from Supabase on mount
  useEffect(() => {
    loadDoors();
  }, []);

  const loadDoors = async () => {
    setIsLoading(true);
    const fetchedDoors = await fetchAllDoors();
    setDoors(fetchedDoors);
    setIsLoading(false);
  };

  // Handle scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 80);
    };

    const optimizedScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScroll, { passive: true });
    return () => window.removeEventListener('scroll', optimizedScroll);
  }, []);

  // Filter doors
  const filteredDoors = useMemo(() => {
    return doors.filter(door => {
      const matchesSearch = searchTerm === '' || 
        door.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        door.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMaterial = selectedMaterials.length === 0 || 
        selectedMaterials.includes(door.material);
      
      const matchesColor = selectedColors.length === 0 || 
        selectedColors.includes(door.color);
      
      const matchesStyle = selectedStyles.length === 0 || 
        selectedStyles.includes(door.style);

      const matchesArrondissement = selectedArrondissements.length === 0 || 
        (door.arrondissement && selectedArrondissements.includes(door.arrondissement));

      const matchesOrnamentation = selectedOrnamentations.length === 0 || 
        (door.ornamentations && selectedOrnamentations.some(o => door.ornamentations?.includes(o)));

      return matchesSearch && matchesMaterial && matchesColor && matchesStyle && matchesArrondissement && matchesOrnamentation;
    });
  }, [doors, searchTerm, selectedMaterials, selectedColors, selectedStyles, selectedArrondissements, selectedOrnamentations]);

  const favoriteDoors = useMemo(() => 
    doors.filter(door => door.isFavorite), [doors]
  );

  // Toggle favorite
  const toggleFavorite = async (doorId: string) => {
    const door = doors.find(d => d.id === doorId);
    if (!door) return;

    const newFavoriteState = !door.isFavorite;
    
    // Optimistic update
    setDoors(prev => prev.map(d => 
      d.id === doorId ? { ...d, isFavorite: newFavoriteState } : d
    ));

    // Update in Supabase
    const success = await toggleFavoriteDoor(doorId, newFavoriteState);
    
    if (!success) {
      // Rollback on error
      setDoors(prev => prev.map(d => 
        d.id === doorId ? { ...d, isFavorite: !newFavoriteState } : d
      ));
    }
  };

  const handleDoorClick = (door: Door) => {
    setSelectedDoor(door);
  };

  const handleBack = () => {
    setSelectedDoor(null);
  };

  // Add new door
  const handleAddDoor = async (newDoorData: Omit<Door, 'id'>) => {
    const addedDoor = await addDoor(newDoorData);
    
    if (addedDoor) {
      setDoors(prev => [addedDoor, ...prev]);
    } else {
      alert('Error adding door. Please try again.');
    }
  };

  // Filter toggles
  const toggleMaterial = (material: DoorMaterial) => {
    setSelectedMaterials(prev => 
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const toggleColor = (color: DoorColor) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleStyle = (style: DoorStyle) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleArrondissement = (arrondissement: DoorArrondissement) => {
    setSelectedArrondissements(prev => 
      prev.includes(arrondissement) ? prev.filter(a => a !== arrondissement) : [...prev, arrondissement]
    );
  };

  const toggleOrnamentation = (ornamentation: DoorOrnamentation) => {
    setSelectedOrnamentations(prev => 
      prev.includes(ornamentation) ? prev.filter(o => o !== ornamentation) : [...prev, ornamentation]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedStyles([]);
    setSelectedArrondissements([]);
    setSelectedOrnamentations([]);
  };

  if (selectedDoor) {
    return (
      <DoorDetail 
        door={selectedDoor}
        onBack={handleBack}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blue-50 to-amber-50">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 z-10 transition-all duration-300">
              <div className={cn(
                "px-4 transition-all duration-300",
                isScrolled ? "py-3" : "py-6"
              )}>
                <div className="text-center">
                  <img 
                    src="/logo2.svg" 
                    alt="My Parisian Doors" 
                    style={{
                      height: isScrolled ? '64px' : '128px',
                      marginBottom: isScrolled ? '0' : '16px',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    className="w-auto mx-auto"
                  />
                  
                  <div className={cn(
                    "transition-all duration-300 overflow-hidden",
                    isScrolled ? "max-h-0 opacity-0" : "max-h-40 opacity-100"
                  )}>
                    <p className="text-sm text-gray-500 mt-1 mb-6">
                      {doors.length} beautiful doors discovered
                    </p>

                    <div className="flex justify-center gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{doors.length}</div>
                        <div className="text-xs text-gray-500">Doors</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-rose-600">{favoriteDoors.length}</div>
                        <div className="text-xs text-gray-500">Favorites</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-amber-600">
                          {new Set(doors.map(d => d.neighborhood)).size}
                        </div>
                        <div className="text-xs text-gray-500">Areas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading doors...</p>
                </div>
              </div>
            ) : filteredDoors.length > 0 ? (
              <MasonryLayout
                doors={filteredDoors}
                onDoorClick={handleDoorClick}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-rose-100 rounded-full flex items-center justify-center mb-6">
                  <Plus className="w-16 h-16 text-blue-400" />
                </div>
                <h2 className="text-xl font-light text-gray-700 mb-2 text-center">
                  Start Your Collection
                </h2>
                <p className="text-gray-500 text-center mb-8 max-w-sm leading-relaxed">
                  Discover and capture the most beautiful doors of Paris. Each door tells a unique story.
                </p>
                <Button 
                  onClick={() => setIsAddDoorOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-rose-500 hover:from-blue-600 hover:to-rose-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Door
                </Button>
              </div>
            )}
          </div>
        );

      case 'search':
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-sage/10 to-gold/20 pb-20">
            <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border/50 z-10 p-4">
              <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-foreground mb-4">Search Doors</h1>
                
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedMaterials={selectedMaterials}
                  selectedColors={selectedColors}
                  selectedStyles={selectedStyles}
                  selectedArrondissements={selectedArrondissements}
                  selectedOrnamentations={selectedOrnamentations}
                  onMaterialToggle={toggleMaterial}
                  onColorToggle={toggleColor}
                  onStyleToggle={toggleStyle}
                  onArrondissementToggle={toggleArrondissement}
                  onOrnamentationToggle={toggleOrnamentation}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredDoors.length} door{filteredDoors.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                {filteredDoors.length > 0 ? (
                  <MasonryLayout
                    doors={filteredDoors}
                    onDoorClick={handleDoorClick}
                    onToggleFavorite={toggleFavorite}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No doors found matching your search</p>
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'map':
        return (
          <MapView 
            doors={filteredDoors}
            onDoorClick={handleDoorClick}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedMaterials={selectedMaterials}
            selectedColors={selectedColors}
            selectedStyles={selectedStyles}
            selectedArrondissements={selectedArrondissements}
            selectedOrnamentations={selectedOrnamentations}
            onMaterialToggle={toggleMaterial}
            onColorToggle={toggleColor}
            onStyleToggle={toggleStyle}
            onArrondissementToggle={toggleArrondissement}
            onOrnamentationToggle={toggleOrnamentation}
            onClearFilters={clearFilters}
          />
        );

      case 'favorites':
        return (
          <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blue-50 to-amber-50 pb-20">
            <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 z-10 p-4">
              <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-6 h-6 text-red-500 fill-current" />
                  <h1 className="text-2xl font-light text-gray-800">Favorites</h1>
                </div>
                <p className="text-gray-500 text-sm">
                  {favoriteDoors.length} favorite door{favoriteDoors.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="px-4">
              {favoriteDoors.length > 0 ? (
                <MasonryLayout
                  doors={favoriteDoors}
                  onDoorClick={handleDoorClick}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <div className="text-center py-20">
                  <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No favorite doors yet</p>
                  <p className="text-sm text-gray-400 mb-6">
                    Tap the heart on any door to save it here
                  </p>
                  <Button 
                    onClick={() => setActiveTab('home')}
                    variant="outline"
                    className="text-gray-600"
                  >
                    Explore Doors
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Button
        onClick={() => setIsAddDoorOpen(true)}
        className="fixed bottom-24 right-4 w-16 h-16 rounded-lg shadow-parisian-xl bg-haussmann text-cream hover:bg-haussmann/90 hover:shadow-parisian-xl transition-all duration-300 z-40 border-2 border-cream/20"
        size="lg"
      >
        <div className="relative flex items-center justify-center">
          <svg className="w-6 h-7" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="2" width="12" height="22" rx="2" fill="currentColor" fillOpacity="0.8"/>
            <rect x="8" y="4" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="8" y="16" width="8" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="15" cy="14" r="1" fill="currentColor"/>
          </svg>
          <div className="absolute -top-0.5 -right-0.5 bg-ochre text-night rounded-full w-3.5 h-3.5 flex items-center justify-center">
            <Plus className="w-2.5 h-2.5" />
          </div>
        </div>
      </Button>

      <AddDoorForm
        isOpen={isAddDoorOpen}
        onClose={() => setIsAddDoorOpen(false)}
        onAddDoor={handleAddDoor}
      />
    </>
  );
};

export default Index;