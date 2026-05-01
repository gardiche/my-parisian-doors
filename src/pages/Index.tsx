// src/pages/Index.tsx - Supabase Version
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Door, DoorMaterial, DoorColor, DoorStyle, DoorArrondissement, DoorOrnamentation } from '@/types/door';
import { fetchAllDoors, addDoor, toggleFavoriteDoor } from '@/lib/supabase';
import { DoorDetail } from '@/components/DoorDetail';
import { MapView } from '@/components/MapView';
import { Navigation } from '@/components/Navigation';
import { SearchFilter } from '@/components/SearchFilter';
import { AddDoorForm } from '@/components/AddDoorForm';
import { AdminPanel } from '@/components/AdminPanel';
import { SplashScreen } from '@/components/SplashScreen';
import { SignUp } from '@/components/SignUp';
import { MyDoors } from '@/components/MyDoors';
import { VerticalDoorCard } from '@/components/VerticalDoorCard';
import { Heart, Plus, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

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
  // Authentication
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useAdmin();

  // State management
  const [doors, setDoors] = useState<Door[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isAddDoorOpen, setIsAddDoorOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(() => {
    // Check if user has seen splash screen before
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>('All');
  const [detailVisible, setDetailVisible] = useState(false);

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

  // Handle splash screen finish
  const handleSplashFinish = () => {
    setShowSplash(false);
    localStorage.setItem('hasSeenSplash', 'true');
  };

  // Handle sign up completion
  const handleSignUpComplete = () => {
    setShowSignUp(false);
  };

  // Force authentication check after splash screen
  // Show signup screen if user is not authenticated
  useEffect(() => {
    if (!showSplash && !authLoading && !user) {
      setShowSignUp(true);
    } else if (!showSplash && !authLoading && user) {
      setShowSignUp(false);
    }
  }, [showSplash, authLoading, user]);

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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDetailVisible(true));
    });
  };

  const handleBack = () => {
    setDetailVisible(false);
    setTimeout(() => setSelectedDoor(null), 380);
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


  const renderContent = () => {
    switch (activeTab) {
      case 'home': {
        const hour = new Date().getHours();
        const greeting = hour < 18 ? 'Bonjour' : 'Bonsoir';
        const firstName = user?.user_metadata?.full_name?.split(' ')[0]
          || user?.email?.split('@')[0]
          || '';

        // Unique neighborhoods for pills
        const neighborhoods = ['All', ...Array.from(new Set(doors.map(d => d.neighborhood).filter(Boolean)))];

        const neighborhoodFilteredDoors = activeNeighborhood === 'All'
          ? filteredDoors
          : filteredDoors.filter(d => d.neighborhood === activeNeighborhood);

        const neighborhoodsCount = new Set(doors.map(d => d.neighborhood).filter(Boolean)).size;

        return (
          <div className="min-h-screen bg-cream pb-24">
            {/* Header */}
            <div className="px-5 pt-8 pb-4 bg-cream">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h1 className="font-calligraphy text-6xl font-medium leading-none text-night">
                    {greeting},
                  </h1>
                  <p className="font-calligraphy text-5xl italic text-haussmann leading-tight mt-1">
                    {firstName}
                  </p>
                </div>
                {/* Avatar */}
                <button
                  onClick={() => setActiveTab('mydoors')}
                  className="w-11 h-11 rounded-full bg-haussmann flex items-center justify-center shadow-parisian flex-shrink-0 mt-1"
                >
                  <span className="text-cream font-semibold text-base uppercase">
                    {firstName?.[0] || '?'}
                  </span>
                </button>
              </div>

              {/* Neighborhood pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
                {neighborhoods.map(n => (
                  <button
                    key={n}
                    onClick={() => setActiveNeighborhood(n)}
                    className={cn(
                      "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                      activeNeighborhood === n
                        ? "bg-night text-cream border-night"
                        : "bg-cream text-charcoal border-stone hover:border-haussmann hover:text-haussmann"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5 px-5 py-3">
              <span className="text-sm text-night">
                <span className="font-semibold">{doors.length}</span>
                <span className="text-charcoal"> doors</span>
              </span>
              <span className="w-px h-3.5 bg-stone" />
              <span className="text-sm text-night">
                <span className="font-semibold">{neighborhoodsCount}</span>
                <span className="text-charcoal"> neighborhoods</span>
              </span>
              <span className="w-px h-3.5 bg-stone" />
              <span className="text-sm text-night">
                <span className="font-semibold">{favoriteDoors.length}</span>
                <span className="text-charcoal"> saved</span>
              </span>
            </div>

            {/* Section title */}
            <div className="flex items-center justify-between px-5 pt-8 pb-3">
              <span className="text-xs font-semibold tracking-widest text-charcoal uppercase">Recent Discoveries</span>
              <button
                onClick={() => setActiveTab('search')}
                className="flex items-center gap-1 text-xs text-haussmann font-medium"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-haussmann border-t-transparent rounded-full animate-spin" />
              </div>
            ) : neighborhoodFilteredDoors.length > 0 ? (
              <MasonryLayout
                doors={neighborhoodFilteredDoors}
                onDoorClick={handleDoorClick}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-8">
                <div className="w-24 h-24 bg-stone rounded-full flex items-center justify-center mb-5">
                  <Plus className="w-10 h-10 text-haussmann" />
                </div>
                <h2 className="text-lg font-display font-light text-night mb-2 text-center">
                  Start Your Collection
                </h2>
                <p className="text-charcoal text-sm text-center mb-6 max-w-xs leading-relaxed">
                  Discover and capture the most beautiful doors of Paris.
                </p>
                <Button
                  onClick={() => setIsAddDoorOpen(true)}
                  className="bg-haussmann hover:bg-haussmann/90 text-cream px-7 py-2.5 rounded-full shadow-parisian transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Door
                </Button>
              </div>
            )}
          </div>
        );
      }

      case 'search':
        return (
          <div className="min-h-screen bg-cream pb-24">
            {/* Header */}
            <div className="px-5 pt-8 pb-5">
              <h1 className="font-calligraphy text-5xl font-medium text-night mb-5">Discover</h1>
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

            {/* Results count */}
            <div className="px-5 py-3 border-t border-stone">
              <p className="text-xs font-semibold tracking-widest text-charcoal uppercase">
                {filteredDoors.length} door{filteredDoors.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Grid */}
            {filteredDoors.length > 0 ? (
              <MasonryLayout
                doors={filteredDoors}
                onDoorClick={handleDoorClick}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <div className="text-center py-16 px-8">
                <p className="text-charcoal mb-4">No doors match your search</p>
                <button onClick={clearFilters} className="text-sm text-haussmann underline underline-offset-4">
                  Clear all filters
                </button>
              </div>
            )}
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
          <div className="min-h-screen bg-cream pb-24">
            <div className="px-5 pt-8 pb-5">
              <p className="text-[10px] font-semibold tracking-widest text-charcoal uppercase mb-2">Your Collection</p>
              <h1 className="font-calligraphy text-5xl font-medium text-night mb-1">Saved Doors</h1>
              <p className="text-sm text-charcoal">
                {favoriteDoors.length} door{favoriteDoors.length !== 1 ? 's' : ''} in your collection
              </p>
            </div>

            {favoriteDoors.length > 0 ? (
              <MasonryLayout
                doors={favoriteDoors}
                onDoorClick={handleDoorClick}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-8">
                <Heart className="w-12 h-12 text-stone mb-4" />
                <p className="text-night font-medium mb-1">No saved doors yet</p>
                <p className="text-sm text-charcoal text-center mb-6">
                  Tap the heart on any door to save it here
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-sm text-haussmann underline underline-offset-4"
                >
                  Explore doors
                </button>
              </div>
            )}
          </div>
        );

      case 'mydoors':
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream via-stone/20 to-haussmann/10 pb-20">
            <MyDoors
              doors={doors}
              onDoorClick={handleDoorClick}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {/* Show auth loading state after splash while checking authentication */}
      {!showSplash && authLoading && (
        <div className="fixed inset-0 z-[9998] bg-gradient-to-br from-rose-50 via-blue-50 to-amber-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-haussmann border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-charcoal">Checking authentication...</p>
          </div>
        </div>
      )}

      {/* Show signup/login screen if not authenticated */}
      {showSignUp && !showSplash && !authLoading && <SignUp onComplete={handleSignUpComplete} />}

      {/* Main app content - only accessible when authenticated */}
      {!showSplash && !showSignUp && !authLoading && user && (
        <>
          {/* Screen container */}
          <div className="relative overflow-hidden">
            {/* Home screen — recule à gauche quand le détail est visible */}
            <div
              style={{
                transform: detailVisible ? 'translateX(-30%)' : 'translateX(0)',
                transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform',
              }}
            >
              {renderContent()}
            </div>

            {/* Detail screen — monte depuis le bas */}
            {selectedDoor && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  transform: detailVisible ? 'translateY(0)' : 'translateY(100%)',
                  transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform',
                  zIndex: 50,
                  overflowY: 'auto',
                  backgroundColor: '#FAF7F2',
                }}
              >
                <DoorDetail
                  door={selectedDoor}
                  onBack={handleBack}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}
          </div>

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
              <div className="absolute -top-1.5 -right-1.5 bg-ochre text-night rounded-full w-3.5 h-3.5 flex items-center justify-center">
                <Plus className="w-2.5 h-2.5" />
              </div>
            </div>
          </Button>
        </>
      )}

      {/* Forms and admin panel - only accessible when authenticated */}
      {!showSplash && !showSignUp && !authLoading && user && (
        <>
          <AddDoorForm
            isOpen={isAddDoorOpen}
            onClose={() => setIsAddDoorOpen(false)}
            onAddDoor={handleAddDoor}
            onNeedLogin={() => setShowSignUp(true)}
          />

          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
          />

          {/* Admin button - only visible to admin users */}
          {isAdmin && (
            <Button
              onClick={() => setIsAdminOpen(true)}
              variant="ghost"
              size="sm"
              className="fixed top-4 right-4 z-40 bg-white/80 backdrop-blur-sm border border-stone hover:bg-haussmann hover:text-white transition-all duration-300 shadow-lg"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default Index;