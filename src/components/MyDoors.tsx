import { useMemo } from 'react';
import { Door, DoorMaterial, DoorColor, DoorStyle, DoorOrnamentation } from '@/types/door';
import { VerticalDoorCard } from '@/components/VerticalDoorCard';
import { User, Calendar, Map as MapIcon, Palette, Hammer, Sparkles, Building2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface MyDoorsProps {
  doors: Door[];
  onDoorClick?: (door: Door) => void;
  onToggleFavorite?: (id: string) => void;
}

interface StatItem {
  label: string;
  count: number;
  percentage?: number;
}

export function MyDoors({ doors, onDoorClick, onToggleFavorite }: MyDoorsProps) {
  const { user, signOut } = useAuth();

  // Filter only doors created by the authenticated user
  const userDoors = useMemo(() => {
    if (!user) {
      // If no user is logged in, show doors added in this session (fallback for anonymous users)
      return doors.filter(door => door.addedBy === 'user');
    }
    // Show only doors created by the authenticated user
    return doors.filter(door => door.userId === user.id);
  }, [doors, user]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (userDoors.length === 0) return null;

    // Materials count
    const materialCounts = userDoors.reduce((acc, door) => {
      acc[door.material] = (acc[door.material] || 0) + 1;
      return acc;
    }, {} as Record<DoorMaterial, number>);

    const topMaterials = Object.entries(materialCounts)
      .map(([label, count]) => ({ label, count, percentage: (count / userDoors.length) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Colors count
    const colorCounts = userDoors.reduce((acc, door) => {
      acc[door.color] = (acc[door.color] || 0) + 1;
      return acc;
    }, {} as Record<DoorColor, number>);

    const topColors = Object.entries(colorCounts)
      .map(([label, count]) => ({ label, count, percentage: (count / userDoors.length) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Styles count
    const styleCounts = userDoors.reduce((acc, door) => {
      acc[door.style] = (acc[door.style] || 0) + 1;
      return acc;
    }, {} as Record<DoorStyle, number>);

    const topStyles = Object.entries(styleCounts)
      .map(([label, count]) => ({ label, count, percentage: (count / userDoors.length) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Arrondissements explored
    const arrondissementsExplored = new Set(
      userDoors.filter(door => door.arrondissement).map(door => door.arrondissement)
    ).size;

    // Top ornamentations
    const ornamentationCounts = userDoors.reduce((acc, door) => {
      door.ornamentations?.forEach(ornamentation => {
        acc[ornamentation] = (acc[ornamentation] || 0) + 1;
      });
      return acc;
    }, {} as Record<DoorOrnamentation, number>);

    const topOrnamentations = Object.entries(ornamentationCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // First and last door dates
    const sortedByDate = [...userDoors].sort((a, b) =>
      new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime()
    );
    const firstDoorDate = sortedByDate[0]?.dateAdded;
    const lastDoorDate = sortedByDate[sortedByDate.length - 1]?.dateAdded;

    return {
      topMaterials,
      topColors,
      topStyles,
      arrondissementsExplored,
      topOrnamentations,
      firstDoorDate,
      lastDoorDate
    };
  }, [userDoors]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (userDoors.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        <div className="text-center py-16">
          <User className="w-16 h-16 mx-auto text-stone mb-4" />
          <h2 className="text-2xl font-display font-semibold text-night mb-2">
            No doors added yet
          </h2>
          <p className="text-charcoal">
            Start photographing Parisian doors to create your collection!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Header with count and logout button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-haussmann" />
            <h1 className="text-3xl font-display font-bold text-night">My Doors</h1>
          </div>

          {/* Logout Button - Only show if user is logged in */}
          {user && (
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="text-charcoal hover:text-white hover:bg-brick border-stone transition-colors gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Log out</span>
            </Button>
          )}
        </div>
        <p className="text-lg text-charcoal">
          <span className="font-semibold text-haussmann">{userDoors.length}</span> door{userDoors.length > 1 ? 's' : ''} added
        </p>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="space-y-4 mb-8">
          {/* Timeline */}
          <div className="bg-white rounded-xl p-4 shadow-parisian border border-stone">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-haussmann" />
              <h3 className="font-display font-semibold text-night">Activity</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal">First door:</span>
                <span className="font-medium text-night">{formatDate(stats.firstDoorDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal">Last door:</span>
                <span className="font-medium text-night">{formatDate(stats.lastDoorDate)}</span>
              </div>
            </div>
          </div>

          {/* Arrondissements */}
          <div className="bg-white rounded-xl p-4 shadow-parisian border border-stone">
            <div className="flex items-center gap-2 mb-3">
              <MapIcon className="w-5 h-5 text-ochre" />
              <h3 className="font-display font-semibold text-night">Exploration</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-ochre">{stats.arrondissementsExplored}</span>
              <span className="text-charcoal">/20 arrondissements explored</span>
            </div>
          </div>

          {/* Top Materials */}
          {stats.topMaterials.length > 0 && (
            <StatCard
              icon={<Hammer className="w-5 h-5 text-sage" />}
              title="Top Materials"
              items={stats.topMaterials}
              color="sage"
            />
          )}

          {/* Top Colors */}
          {stats.topColors.length > 0 && (
            <StatCard
              icon={<Palette className="w-5 h-5 text-brick" />}
              title="Top Colors"
              items={stats.topColors}
              color="brick"
            />
          )}

          {/* Top Styles */}
          {stats.topStyles.length > 0 && (
            <StatCard
              icon={<Building2 className="w-5 h-5 text-haussmann" />}
              title="Top Styles"
              items={stats.topStyles}
              color="haussmann"
            />
          )}

          {/* Top Ornamentations */}
          {stats.topOrnamentations.length > 0 && (
            <StatCard
              icon={<Sparkles className="w-5 h-5 text-ochre" />}
              title="Top Ornamentations"
              items={stats.topOrnamentations}
              color="ochre"
            />
          )}
        </div>
      )}

      {/* Gallery Title */}
      <h2 className="text-xl font-display font-semibold text-night mb-4">
        My Collection
      </h2>

      {/* Masonry Gallery */}
      <div className="columns-2 gap-3 space-y-3">
        {userDoors.map((door) => (
          <div key={door.id} className="break-inside-avoid">
            <VerticalDoorCard
              door={door}
              onCardClick={onDoorClick}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  items: StatItem[];
  color: 'haussmann' | 'sage' | 'brick' | 'ochre';
}

function StatCard({ icon, title, items, color }: StatCardProps) {
  const colorClasses = {
    haussmann: 'text-haussmann bg-haussmann/10',
    sage: 'text-sage bg-sage/10',
    brick: 'text-brick bg-brick/10',
    ochre: 'text-ochre bg-ochre/10'
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-parisian border border-stone">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-display font-semibold text-night">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              colorClasses[color]
            )}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-medium text-night truncate">{item.label}</span>
                <span className="text-sm text-charcoal shrink-0">
                  {item.count} door{item.count > 1 ? 's' : ''}
                </span>
              </div>
              {item.percentage !== undefined && (
                <div className="mt-1 bg-stone rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", {
                      'bg-haussmann': color === 'haussmann',
                      'bg-sage': color === 'sage',
                      'bg-brick': color === 'brick',
                      'bg-ochre': color === 'ochre'
                    })}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
