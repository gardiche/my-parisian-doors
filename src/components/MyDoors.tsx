import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Door, DoorMaterial, DoorColor, DoorStyle, DoorOrnamentation } from '@/types/door';
import { VerticalDoorCard } from '@/components/VerticalDoorCard';
import { ParisMap } from '@/components/ParisMap';
import { Confetti } from '@/components/Confetti';
import { computeBadges, getExplorerRank, Badge } from '@/lib/badges';
import { MapPin, LogOut, Camera, Trophy, ChevronDown, ChevronUp, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SEEN_BADGES_KEY = 'myDoors_seenBadges';

interface MyDoorsProps {
  doors: Door[];
  onDoorClick?: (door: Door) => void;
  onToggleFavorite?: (id: string) => void;
}

const COLOR_HEX: Record<string, string> = {
  Green: '#A8C3A1', Blue: '#A9C3D1', Black: '#3A3A3A', White: '#F3EDE7',
  Cream: '#F0DCC2', Brown: '#C9A689', Red: '#E7A9A1', Gray: '#D5D5D5',
};

// ─── Animated counter ───
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        ref.current = value;
      }
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display}</>;
}

// ─── Badge card ───
function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const tierColors = {
    bronze:   { bg: 'bg-amber-50',   border: 'border-amber-200',   ring: 'ring-amber-300' },
    silver:   { bg: 'bg-slate-50',   border: 'border-slate-200',   ring: 'ring-slate-300' },
    gold:     { bg: 'bg-yellow-50',  border: 'border-yellow-300',  ring: 'ring-yellow-400' },
    platinum: { bg: 'bg-violet-50',  border: 'border-violet-200',  ring: 'ring-violet-400' },
  };

  const tc = tierColors[badge.tier];

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-3 transition-all duration-500 animate-fade-in",
        badge.unlocked
          ? `${tc.bg} ${tc.border}`
          : "bg-stone/30 border-stone"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Icon circle */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0",
          badge.unlocked ? `${tc.bg} ring-2 ${tc.ring}` : "bg-stone/50 grayscale"
        )}>
          {badge.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-1">
            <span className={cn(
              "text-xs font-semibold truncate",
              badge.unlocked ? "text-night" : "text-charcoal/60"
            )}>
              {badge.name}
            </span>
            {badge.unlocked && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-haussmann flex-shrink-0">
                Done
              </span>
            )}
          </div>
          <p className={cn(
            "text-[10px] leading-tight mt-0.5",
            badge.unlocked ? "text-charcoal" : "text-charcoal/50"
          )}>
            {badge.description}
          </p>

          {/* Progress bar */}
          {!badge.unlocked && (
            <div className="mt-2">
              <div className="h-1 bg-stone rounded-full overflow-hidden">
                <div
                  className="h-full bg-haussmann/60 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${badge.progress * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-charcoal/50 mt-0.5 block">
                {badge.current} / {badge.target}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Color swatches ───
function ColorSwatches({ colors }: { colors: { label: string; count: number }[] }) {
  return (
    <div className="flex items-center gap-2">
      {colors.map((c) => (
        <div key={c.label} className="flex flex-col items-center gap-1.5">
          <div
            className="w-9 h-9 rounded-full border-2 border-white shadow-parisian"
            style={{ backgroundColor: COLOR_HEX[c.label] || '#D5D5D5' }}
          />
          <span className="text-[10px] text-charcoal font-medium">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Rank progress bar ───
function RankProgress({ current, next, doorsToNext, totalDoors }: {
  current: string; next: string | null; doorsToNext: number; totalDoors: number;
}) {
  if (!next) return null;

  const nextMin = totalDoors + doorsToNext;
  const prevMin = nextMin - doorsToNext - (totalDoors > 0 ? totalDoors : 1);
  const range = nextMin - prevMin;
  const progress = range > 0 ? ((totalDoors - prevMin) / range) : 0;

  return (
    <div className="mt-2">
      <div className="h-1.5 bg-stone rounded-full overflow-hidden">
        <div
          className="h-full bg-ochre rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-charcoal mt-1">
        <span className="font-medium text-night">{doorsToNext}</span> door{doorsToNext !== 1 ? 's' : ''} to <span className="font-semibold text-night">{next}</span>
      </p>
    </div>
  );
}


export function MyDoors({ doors, onDoorClick, onToggleFavorite }: MyDoorsProps) {
  const { user, signOut, deleteAccount } = useAuth();
  const [badgesExpanded, setBadgesExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'neighborhood' | 'color'>('recent');
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState<string | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const userDoors = useMemo(() => {
    if (!user) return doors.filter(door => door.addedBy === 'user');
    return doors.filter(door => door.userId === user.id);
  }, [doors, user]);

  // Badges
  const badges = useMemo(() => computeBadges(userDoors), [userDoors]);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const rank = useMemo(() => getExplorerRank(userDoors.length), [userDoors.length]);

  // Detect newly unlocked badges → confetti
  useEffect(() => {
    const unlockedIds = badges.filter(b => b.unlocked).map(b => b.id);
    if (unlockedIds.length === 0) return;

    try {
      const stored = JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) || '[]') as string[];
      const newOnes = unlockedIds.filter(id => !stored.includes(id));

      if (newOnes.length > 0) {
        localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(unlockedIds));
        const newest = badges.find(b => b.id === newOnes[newOnes.length - 1]);
        setNewBadgeName(newest?.name || null);
        setShowConfetti(true);
      } else {
        localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(unlockedIds));
      }
    } catch {
      localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(unlockedIds));
    }
  }, [badges]);

  const handleConfettiDone = useCallback(() => {
    setShowConfetti(false);
    setNewBadgeName(null);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    const result = await deleteAccount();

    if (!result.success) {
      setDeleteAccountError(result.error || 'Account deletion failed. Please try again.');
      setIsDeletingAccount(false);
      return;
    }

    setIsDeletingAccount(false);
    setShowDeleteAccount(false);
  }, [deleteAccount]);

  const accountActions = user ? (
    <>
      <div className="h-px bg-stone mb-5" />
      <div className="flex flex-col items-start gap-3">
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-charcoal hover:text-brick text-sm transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Log out</span>
        </button>
        <button
          onClick={() => {
            setDeleteAccountError(null);
            setShowDeleteAccount(true);
          }}
          className="flex items-center gap-2 text-brick/80 hover:text-brick text-sm transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Delete account</span>
        </button>
      </div>

      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl border-stone bg-cream p-5 shadow-parisian-xl sm:max-w-md">
          <DialogHeader className="text-left">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brick/10">
              <AlertTriangle className="h-5 w-5 text-brick" />
            </div>
            <DialogTitle className="font-display text-xl font-light text-night">
              Delete your account?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-charcoal">
              This permanently deletes your profile, saved doors, favorites, and uploaded images. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteAccountError && (
            <div className="rounded-xl border border-brick/20 bg-brick/10 px-3 py-2 text-xs leading-relaxed text-brick">
              {deleteAccountError}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2 sm:space-x-0">
            <button
              type="button"
              onClick={() => setShowDeleteAccount(false)}
              disabled={isDeletingAccount}
              className="rounded-full border border-stone px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:border-haussmann disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brick px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-brick/90 disabled:opacity-70"
            >
              {isDeletingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete permanently
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  ) : null;

  // Stats
  const stats = useMemo(() => {
    if (userDoors.length === 0) return null;

    const colorCounts = userDoors.reduce((acc, door) => {
      acc[door.color] = (acc[door.color] || 0) + 1;
      return acc;
    }, {} as Record<DoorColor, number>);
    const topColors = Object.entries(colorCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const arrondissements = new Set(
      userDoors.filter(d => d.arrondissement).map(d => d.arrondissement)
    );

    const neighborhoods = new Set(userDoors.map(d => d.neighborhood).filter(Boolean));
    const favCount = userDoors.filter(d => d.isFavorite).length;

    const sortedByDate = [...userDoors].sort((a, b) =>
      new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime()
    );
    const firstDoorDate = sortedByDate[0]?.dateAdded;

    return { topColors, arrondissements, neighborhoods: Array.from(neighborhoods), favCount, firstDoorDate };
  }, [userDoors]);

  // Sorted gallery
  const sortedDoors = useMemo(() => {
    const copy = [...userDoors];
    switch (sortBy) {
      case 'recent':
        return copy.sort((a, b) =>
          new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime()
        );
      case 'neighborhood':
        return copy.sort((a, b) => (a.neighborhood || '').localeCompare(b.neighborhood || ''));
      case 'color':
        return copy.sort((a, b) => a.color.localeCompare(b.color));
      default:
        return copy;
    }
  }, [userDoors, sortBy]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || '';

  const memberSince = stats?.firstDoorDate
    ? new Date(stats.firstDoorDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  // ─── Empty state ───
  if (userDoors.length === 0) {
    return (
      <div className="min-h-screen bg-cream pb-24">
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-charcoal uppercase mb-2">Profile</p>
              <h1 className="font-calligraphy text-5xl font-medium text-night">{firstName || 'Explorer'}</h1>
              <p className="text-xs text-charcoal mt-1 italic">Curious — Rank 1</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-haussmann flex items-center justify-center shadow-parisian">
              <span className="text-cream font-semibold text-xl uppercase">{firstName?.[0] || '?'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-20 h-20 bg-stone rounded-full flex items-center justify-center mb-5">
            <Camera className="w-8 h-8 text-haussmann" />
          </div>
          <h2 className="text-lg font-display font-light text-night mb-2 text-center">
            Start your collection
          </h2>
          <p className="text-charcoal text-sm text-center max-w-xs leading-relaxed">
            Photograph Parisian doors to earn badges and climb the ranks.
          </p>
        </div>

        {user && <div className="px-5 pt-8">{accountActions}</div>}
      </div>
    );
  }

  // Show top 4 badges by default, all when expanded
  const visibleBadges = badgesExpanded ? badges : badges.slice(0, 4);

  return (
    <div className="min-h-screen bg-cream pb-24">

      {/* ── Confetti ── */}
      <Confetti active={showConfetti} onComplete={handleConfettiDone} />

      {/* ── Badge unlocked toast ── */}
      {showConfetti && newBadgeName && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9998] animate-fade-in">
          <div className="bg-night/90 backdrop-blur-md text-cream px-5 py-3 rounded-2xl shadow-parisian-xl flex items-center gap-3">
            <Trophy className="w-5 h-5 text-ochre" />
            <div>
              <p className="text-xs text-cream/70">Badge unlocked!</p>
              <p className="text-sm font-semibold">{newBadgeName}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-5 pt-8 pb-1">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-charcoal uppercase mb-2">Profile</p>
            <h1 className="font-calligraphy text-5xl font-medium text-night leading-none">
              {firstName}
            </h1>
          </div>
          <div className="w-14 h-14 rounded-full bg-haussmann flex items-center justify-center shadow-parisian flex-shrink-0 mt-1">
            <span className="text-cream font-semibold text-xl uppercase">{firstName?.[0] || '?'}</span>
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center gap-2 mt-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: rank.color }}
          />
          <span className="text-sm font-medium text-night">{rank.title}</span>
          {memberSince && (
            <>
              <span className="text-charcoal text-xs">·</span>
              <span className="text-xs text-charcoal">since {memberSince}</span>
            </>
          )}
        </div>
        <RankProgress
          current={rank.title}
          next={rank.next?.title || null}
          doorsToNext={rank.doorsToNext}
          totalDoors={userDoors.length}
        />
      </div>

      {/* ── Quick stats row ── */}
      <div className="flex items-center gap-5 px-5 py-4">
        <span className="text-sm text-night">
          <span className="font-semibold"><AnimatedNumber value={userDoors.length} /></span>
          <span className="text-charcoal"> door{userDoors.length !== 1 ? 's' : ''}</span>
        </span>
        <span className="w-px h-3.5 bg-stone" />
        <span className="text-sm text-night">
          <span className="font-semibold"><AnimatedNumber value={stats?.arrondissements.size || 0} /></span>
          <span className="text-charcoal"> arr.</span>
        </span>
        <span className="w-px h-3.5 bg-stone" />
        <span className="text-sm text-night">
          <span className="font-semibold"><AnimatedNumber value={stats?.favCount || 0} /></span>
          <span className="text-charcoal"> saved</span>
        </span>
        <span className="w-px h-3.5 bg-stone" />
        <span className="text-sm text-night">
          <span className="font-semibold">{unlockedCount}</span>
          <span className="text-charcoal">/{badges.length}</span>
          <Trophy className="w-3 h-3 text-ochre inline ml-1 -mt-0.5" />
        </span>
      </div>

      {/* ── Badges section ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-widest text-charcoal uppercase">
            Badges
          </span>
          <span className="text-[10px] text-charcoal">
            {unlockedCount} unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {visibleBadges.map((badge, i) => (
            <BadgeCard key={badge.id} badge={badge} index={i} />
          ))}
        </div>

        {badges.length > 4 && (
          <button
            onClick={() => setBadgesExpanded(!badgesExpanded)}
            className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-xs text-haussmann font-medium"
          >
            {badgesExpanded ? (
              <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>See all {badges.length} badges <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        )}
      </div>

      {/* ── Paris map ── */}
      {stats && (
        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl border border-stone p-5 animate-fade-in">
            <p className="text-[10px] font-semibold tracking-widest text-charcoal uppercase mb-4 text-center">
              Your Paris
            </p>
            <ParisMap exploredArrondissements={stats.arrondissements} />
          </div>
        </div>
      )}

      {/* ── Color palette ── */}
      {stats && stats.topColors.length > 0 && (
        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl border border-stone p-4 animate-fade-in">
            <p className="text-[10px] font-semibold tracking-widest text-charcoal uppercase mb-3">
              Color Palette
            </p>
            <ColorSwatches colors={stats.topColors} />
          </div>
        </div>
      )}

      {/* ── Collection gallery ── */}
      <div className="px-5">
        <div className="flex items-center justify-between pt-4 pb-3 border-t border-stone">
          <span className="text-[10px] font-semibold tracking-widest text-charcoal uppercase">
            My Collection
          </span>

          {/* Sort pills */}
          <div className="flex gap-1.5">
            {(['recent', 'neighborhood', 'color'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-200",
                  sortBy === s
                    ? "bg-night text-cream border-night"
                    : "bg-cream text-charcoal border-stone hover:border-haussmann"
                )}
              >
                {s === 'recent' ? 'Recent' : s === 'neighborhood' ? 'Area' : 'Color'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {sortedDoors.map((door, index) => (
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
      </div>

      {/* ── Log out ── */}
      {user && <div className="px-5 pt-4 pb-8">{accountActions}</div>}
    </div>
  );
}
