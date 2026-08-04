import { cn } from '@/lib/utils';

interface ParisMapProps {
  exploredArrondissements: Set<string>;
}

interface ArrData {
  num: number;
  label: string;
  d: string;
  labelX: number;
  labelY: number;
}

// Simplified SVG paths for Paris arrondissements — spiraling from center outward
// Viewbox: 0 0 300 260
const ARRONDISSEMENTS: ArrData[] = [
  { num: 1,  label: '1',  d: 'M132,115 L152,108 L160,118 L158,132 L142,135 L130,128Z', labelX: 145, labelY: 124 },
  { num: 2,  label: '2',  d: 'M152,108 L170,96 L182,104 L178,118 L160,118Z', labelX: 166, labelY: 110 },
  { num: 3,  label: '3',  d: 'M178,118 L182,104 L200,100 L206,116 L192,125Z', labelX: 192, labelY: 114 },
  { num: 4,  label: '4',  d: 'M158,132 L160,118 L178,118 L192,125 L188,142 L168,145Z', labelX: 174, labelY: 132 },
  { num: 5,  label: '5',  d: 'M142,135 L158,132 L168,145 L170,168 L148,170 L135,155Z', labelX: 154, labelY: 152 },
  { num: 6,  label: '6',  d: 'M108,140 L132,115 L142,135 L135,155 L118,162 L100,152Z', labelX: 122, labelY: 142 },
  { num: 7,  label: '7',  d: 'M68,135 L100,110 L132,115 L108,140 L100,152 L78,158 L60,148Z', labelX: 94, labelY: 134 },
  { num: 8,  label: '8',  d: 'M100,110 L120,88 L152,82 L152,108 L132,115Z', labelX: 128, labelY: 100 },
  { num: 9,  label: '9',  d: 'M152,82 L170,74 L188,78 L182,96 L170,96 L152,108Z', labelX: 170, labelY: 88 },
  { num: 10, label: '10', d: 'M188,78 L210,72 L220,88 L210,100 L200,100 L182,104 L182,96Z', labelX: 200, labelY: 88 },
  { num: 11, label: '11', d: 'M206,116 L210,100 L220,88 L240,100 L242,128 L225,140 L192,125Z', labelX: 220, labelY: 116 },
  { num: 12, label: '12', d: 'M188,142 L192,125 L225,140 L242,128 L250,158 L240,188 L210,195 L185,175Z', labelX: 222, labelY: 162 },
  { num: 13, label: '13', d: 'M148,170 L170,168 L185,175 L210,195 L195,218 L162,225 L140,210 L138,185Z', labelX: 172, labelY: 198 },
  { num: 14, label: '14', d: 'M100,152 L118,162 L135,155 L148,170 L138,185 L140,210 L115,220 L88,205 L80,178Z', labelX: 116, labelY: 188 },
  { num: 15, label: '15', d: 'M38,148 L60,148 L78,158 L100,152 L80,178 L88,205 L68,215 L42,200 L30,172Z', labelX: 62, labelY: 180 },
  { num: 16, label: '16', d: 'M20,100 L50,82 L68,100 L68,135 L60,148 L38,148 L30,172 L15,155 L10,125Z', labelX: 38, labelY: 125 },
  { num: 17, label: '17', d: 'M50,82 L80,58 L120,48 L120,88 L100,110 L68,100Z', labelX: 88, labelY: 78 },
  { num: 18, label: '18', d: 'M120,48 L155,38 L185,42 L188,60 L170,74 L152,82 L120,88Z', labelX: 155, labelY: 62 },
  { num: 19, label: '19', d: 'M185,42 L218,38 L245,55 L240,80 L220,88 L210,72 L188,78 L188,60Z', labelX: 218, labelY: 62 },
  { num: 20, label: '20', d: 'M240,80 L260,95 L262,130 L242,128 L240,100 L220,88Z', labelX: 250, labelY: 108 },
];

function arrondissementKey(num: number): string {
  const suffixes: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };
  return suffixes[num] || `${num}th`;
}

export function ParisMap({ exploredArrondissements }: ParisMapProps) {
  const isExplored = (num: number) => {
    const prefix = arrondissementKey(num);
    return Array.from(exploredArrondissements).some(a => a?.startsWith(prefix));
  };

  const exploredCount = ARRONDISSEMENTS.filter(a => isExplored(a.num)).length;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 280 260"
        className="w-full max-w-[240px]"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.06))' }}
      >
        {ARRONDISSEMENTS.map(arr => {
          const explored = isExplored(arr.num);
          return (
            <g key={arr.num}>
              <path
                d={arr.d}
                fill={explored ? '#2E4A62' : '#E5E3DF'}
                stroke="#FAF7F2"
                strokeWidth="1.5"
                className="transition-all duration-500 ease-out"
                style={{
                  opacity: explored ? 1 : 0.6,
                }}
              />
              <text
                x={arr.labelX}
                y={arr.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={explored ? '#FAF7F2' : '#999'}
                fontSize="8"
                fontWeight={explored ? '700' : '400'}
                fontFamily="system-ui, sans-serif"
                className="select-none pointer-events-none"
              >
                {arr.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-charcoal mt-2">
        <span className="font-semibold text-night">{exploredCount}</span> / 20 arrondissements explored
      </p>
    </div>
  );
}
