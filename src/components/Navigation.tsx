import { Home, Map, Search, Heart, Plus, CircleUserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddDoor: () => void;
}

export function Navigation({ activeTab, onTabChange, onAddDoor }: NavigationProps) {
  const leftTabs = [{ id: 'home', icon: Home }, { id: 'map', icon: Map }];
  const rightTabs = [{ id: 'search', icon: Search }, { id: 'mydoors', icon: CircleUserRound }];

  const W = 280;      // total bar width
  const H = 56;       // bar height
  const R = 20;       // corner radius of bar
  const NR = 26;      // notch radius
  const NX = W / 2;  // notch center x

  // SVG path: rounded rect with circular notch cut at top-center
  const path = `
    M ${R} 0
    L ${NX - NR - 12} 0
    C ${NX - NR - 4} 0 ${NX - NR} ${NR * 0.15} ${NX - NR * 0.7} ${NR * 0.7}
    A ${NR} ${NR} 0 0 0 ${NX + NR * 0.7} ${NR * 0.7}
    C ${NX + NR} ${NR * 0.15} ${NX + NR + 4} 0 ${NX + NR + 12} 0
    L ${W - R} 0
    Q ${W} 0 ${W} ${R}
    L ${W} ${H - R}
    Q ${W} ${H} ${W - R} ${H}
    L ${R} ${H}
    Q 0 ${H} 0 ${H - R}
    L 0 ${R}
    Q 0 0 ${R} 0
    Z
  `;

  const TabButton = ({ id, icon: Icon }: { id: string; icon: any }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => onTabChange(id)}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
          isActive ? 'bg-stone/60' : 'hover:bg-stone/40'
        )}
      >
        <Icon
          className={cn('w-5 h-5 transition-colors duration-200', isActive ? 'text-night' : 'text-charcoal')}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
      <div className="relative pointer-events-auto" style={{ width: W }}>

        {/* SVG bar with notch */}
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 drop-shadow-[0_-2px_16px_rgba(0,0,0,0.10)]"
        >
          <path d={path} fill="white" />
        </svg>

        {/* Tab buttons */}
        <div className="relative flex items-center justify-between px-3" style={{ height: H }}>
          {/* Left */}
          <div className="flex items-center gap-0.5">
            {leftTabs.map(t => <TabButton key={t.id} {...t} />)}
          </div>

          {/* Center — favorites, positioned lower */}
          <button
            onClick={() => onTabChange('favorites')}
            className="flex items-center justify-center w-10 h-10 mt-5"
          >
            <Heart
              className={cn('w-4 h-4 transition-colors duration-200', activeTab === 'favorites' ? 'text-red-500' : 'text-charcoal/50')}
              strokeWidth={1.8}
              fill={activeTab === 'favorites' ? 'currentColor' : 'none'}
            />
          </button>

          {/* Right */}
          <div className="flex items-center gap-0.5">
            {rightTabs.map(t => <TabButton key={t.id} {...t} />)}
          </div>
        </div>

        {/* + button — sits in the notch */}
        <button
          onClick={onAddDoor}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-haussmann flex items-center justify-center shadow-parisian-xl transition-transform duration-200 active:scale-95 hover:bg-haussmann/90"
          style={{ top: 0 }}
        >
          <Plus className="w-5 h-5 text-cream" strokeWidth={2.5} />
        </button>

      </div>
    </div>
  );
}
