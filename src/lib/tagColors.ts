// Tag color configuration for door properties
export const TAG_COLORS = {
  color: {
    green: '#A8C3A1',
    blue: '#A9C3D1',
    black: '#B6B6B6',
    white: '#F3EDE7',
    cream: '#F0DCC2',
    brown: '#C9A689',
    red: '#E7A9A1',
    gray: '#D5D5D5'
  },
  material: {
    wood: '#D7B49E',
    metal: '#C3C7CE',
    glass: '#C8E1E7',
    stone: '#E4DAD0',
    composite: '#B9C4B2'
  },
  style: {
    haussmann: '#E6D9C5',
    artNouveau: '#B9D2B1',
    modern: '#C8D4E3',
    vintage: '#E5C3C6',
    industrial: '#C0BEB9',
    classic: '#B5C1CA'
  },
  ornament: {
    ironwork: '#C7C9C5',
    stainedGlass: '#CDB7E9',
    woodCarving: '#DCC3A1',
    columns: '#E9E2D3',
    pediment: '#D2CDC5',
    doorKnocker: '#D6A77A',
    moldings: '#F1EDE6',
    flowers: '#F3B6B2',
    goldenDetails: '#E8C547'
  }
} as const;

// Helper function to get color for a property
export function getTagColor(
  category: 'color' | 'material' | 'style' | 'ornament',
  value: string
): string {
  const normalizedValue = value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '');

  const colorMap = TAG_COLORS[category] as Record<string, string>;

  // Try exact match first
  if (colorMap[normalizedValue]) {
    return colorMap[normalizedValue];
  }

  // Try to find a match without special characters
  const key = Object.keys(colorMap).find(k =>
    k.toLowerCase() === normalizedValue
  );

  if (key) {
    return colorMap[key];
  }

  // Default fallback colors
  const fallbacks = {
    color: '#D5D5D5',
    material: '#D7B49E',
    style: '#E6D9C5',
    ornament: '#E9E2D3'
  };

  return fallbacks[category];
}

// Helper to get contrasting text color
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.6 ? '#2C2C2C' : '#FFFFFF';
}
