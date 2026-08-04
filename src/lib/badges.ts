import { Door } from '@/types/door';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // SVG path or emoji for now
  unlocked: boolean;
  progress: number; // 0-1
  current: number;
  target: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export type ExplorerRank = {
  title: string;
  minDoors: number;
  color: string;
};

const RANKS: ExplorerRank[] = [
  { title: 'Curious',       minDoors: 0,  color: '#E5E3DF' },
  { title: 'Stroller',      minDoors: 3,  color: '#C9A689' },
  { title: 'Flâneur',       minDoors: 8,  color: '#9BBFA2' },
  { title: 'Connoisseur',   minDoors: 15, color: '#A9C3D1' },
  { title: 'Expert',        minDoors: 30, color: '#D9A441' },
  { title: 'Door Master',   minDoors: 50, color: '#A6473C' },
];

export function getExplorerRank(doorCount: number): ExplorerRank & { next: ExplorerRank | null; doorsToNext: number } {
  let current = RANKS[0];
  let next: ExplorerRank | null = null;

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (doorCount >= RANKS[i].minDoors) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
      break;
    }
  }

  return {
    ...current,
    next,
    doorsToNext: next ? next.minDoors - doorCount : 0,
  };
}

export function computeBadges(userDoors: Door[]): Badge[] {
  const count = userDoors.length;

  const arrondissements = new Set(
    userDoors.filter(d => d.arrondissement).map(d => d.arrondissement)
  );

  const colors = new Set(userDoors.map(d => d.color));
  const materials = new Set(userDoors.map(d => d.material));
  const styles = new Set(userDoors.map(d => d.style));

  const ornamentationTypes = new Set<string>();
  userDoors.forEach(d => d.ornamentations?.forEach(o => ornamentationTypes.add(o)));

  const haussmannCount = userDoors.filter(d => d.style === 'Haussmann').length;
  const artNouveauCount = userDoors.filter(d => d.style === 'Art Nouveau').length;
  const neighborhoods = new Set(userDoors.map(d => d.neighborhood).filter(Boolean));

  const badge = (
    id: string,
    name: string,
    description: string,
    icon: string,
    current: number,
    target: number,
    tier: Badge['tier']
  ): Badge => ({
    id,
    name,
    description,
    icon,
    unlocked: current >= target,
    progress: Math.min(current / target, 1),
    current,
    target,
    tier,
  });

  return [
    badge('first-step',    'First Step',       'Add your first door',                   '🚪', count, 1,  'bronze'),
    badge('flaneur',       'Flâneur',          'Add 5 doors to your collection',        '🚶', count, 5,  'bronze'),
    badge('collector',     'Collector',        'Reach 20 doors',                        '🗝️', count, 20, 'silver'),
    badge('obsessed',      'Obsessed',         'Reach 50 doors',                        '🏆', count, 50, 'gold'),
    badge('explorer-5',    'Explorer',         'Discover 5 different arrondissements',  '🗺️', arrondissements.size, 5,  'bronze'),
    badge('grand-explorer','Grand Explorer',   'Discover 10 arrondissements',           '🧭', arrondissements.size, 10, 'silver'),
    badge('full-paris',    'True Parisian',    'Explore all 20 arrondissements',        '⭐', arrondissements.size, 20, 'platinum'),
    badge('rainbow',       'Rainbow',          'Find doors in 5 different colors',      '🌈', colors.size, 5, 'silver'),
    badge('artisan',       'Artisan',          'Discover all 5 material types',         '🔨', materials.size, 5, 'silver'),
    badge('sharp-eye',     'Sharp Eye',        'Identify 5 ornamentation types',        '👁️', ornamentationTypes.size, 5, 'silver'),
    badge('haussmann-fan', 'Haussmann Fan',    'Collect 5 Haussmann-style doors',       '🏛️', haussmannCount, 5, 'bronze'),
    badge('art-nouveau',   'Belle Époque',     'Collect 3 Art Nouveau doors',           '🌸', artNouveauCount, 3, 'bronze'),
    badge('wanderer',      'Wanderer',         'Visit 8 different neighborhoods',       '🧳', neighborhoods.size, 8, 'silver'),
    badge('style-hunter',  'Style Hunter',     'Discover all 6 architectural styles',   '🎨', styles.size, 6, 'gold'),
  ];
}
