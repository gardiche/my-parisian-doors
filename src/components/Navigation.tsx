// Updated src/components/Navigation.tsx with Parisian UI
import { Home, Map, Heart, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, color: 'haussmann' },
    { id: 'search', label: 'Search', icon: Search, color: 'sage' },
    { id: 'map', label: 'Map', icon: Map, color: 'ochre' },
    { id: 'favorites', label: 'Favorites', icon: Heart, color: 'brick' },
    { id: 'mydoors', label: 'My doors', icon: User, color: 'charcoal' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-xl border-t border-stone z-50 shadow-parisian-lg">
      <div className="flex items-center justify-around py-3 max-w-md mx-auto px-4">
        {tabs.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTab === id;
          
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 min-w-[60px]",
                isActive
                  ? cn(
                      "shadow-parisian",
                      {
                        'bg-haussmann text-cream': color === 'haussmann',
                        'bg-sage text-night': color === 'sage',
                        'bg-ochre text-night': color === 'ochre',
                        'bg-brick text-cream': color === 'brick',
                        'bg-charcoal text-cream': color === 'charcoal',
                      }
                    )
                  : "text-charcoal hover:text-night hover:bg-stone/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn(
                "font-medium font-display whitespace-nowrap",
                label.length > 8 ? "text-[10px]" : "text-xs"
              )}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}