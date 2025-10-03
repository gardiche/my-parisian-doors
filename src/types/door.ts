// src/types/door.ts

export type DoorMaterial = 'Wood' | 'Metal' | 'Glass' | 'Stone' | 'Composite';
export type DoorColor = 'Blue' | 'Green' | 'Red/Burgundy' | 'Black' | 'Grey' | 'Natural Wood' | 'White' | 'Yellow' | 'Multicolor';
export type DoorStyle = 'Haussmann' | 'Art Nouveau' | 'Modern' | 'Vintage' | 'Industrial' | 'Classic';
export type DoorArrondissement = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th' | '9th' | '10th' | '11th' | '12th' | '13th' | '14th' | '15th' | '16th' | '17th' | '18th' | '19th' | '20th';
export type DoorOrnamentation = 'Ironwork' | 'Stained Glass' | 'Wood Carving' | 'Columns' | 'Pediment' | 'Door Knocker' | 'Moldings' | 'Flowers';

export interface Door {
  id: string;
  imageUrl: string;
  location: string;
  neighborhood: string;
  arrondissement?: DoorArrondissement;
  material: DoorMaterial;
  color: DoorColor;
  style: DoorStyle;
  ornamentation?: DoorOrnamentation[];
  description?: string;
  isFavorite: boolean;
  // Timeline fields
  dateAdded?: string; // ISO date string
  addedBy?: 'user' | 'preset'; // Track if user-generated or sample data
  // Optional coordinates for precise mapping
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DoorFilter {
  searchTerm: string;
  materials: DoorMaterial[];
  colors: DoorColor[];
  styles: DoorStyle[];
  arrondissements: DoorArrondissement[];
  ornamentations: DoorOrnamentation[];
}

// Sample data with your door images (English) - Updated with new fields
export const sampleDoors: Door[] = [
  {
    id: '1',
    imageUrl: '/door-1.jpg',
    location: 'Rue des Rosiers',
    neighborhood: 'Le Marais',
    arrondissement: '4th',
    material: 'Wood',
    color: 'Green',
    style: 'Haussmann',
    ornamentation: ['Wood Carving', 'Moldings'],
    description: 'A magnificent Haussmannian door with complex carved details and a green patina characteristic of the Marais district.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '2',
    imageUrl: '/door-2.jpg',
    location: 'Place du Tertre',
    neighborhood: 'Montmartre',
    arrondissement: '18th',
    material: 'Wood',
    color: 'Blue',
    style: 'Art Nouveau',
    ornamentation: ['Stained Glass', 'Flowers'],
    description: 'Art Nouveau door with delicate floral motifs, typical of early 20th century Montmartre architecture.',
    isFavorite: true,
    addedBy: 'preset'
  },
  {
    id: '3',
    imageUrl: '/door-3.jpg',
    location: 'Boulevard Saint-Germain',
    neighborhood: 'Saint-Germain',
    arrondissement: '6th',
    material: 'Metal',
    color: 'Black',
    style: 'Modern',
    ornamentation: ['Columns'],
    description: 'Contemporary minimalist design with bold geometric lines, perfectly integrated into the Parisian urban landscape.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '4',
    imageUrl: '/door-4.jpg',
    location: 'Avenue des Champs-Élysées',
    neighborhood: 'Champs-Élysées',
    arrondissement: '8th',
    material: 'Glass',
    color: 'White',
    style: 'Modern',
    ornamentation: ['Ironwork', 'Door Knocker'],
    description: 'Luxurious entrance to a prestigious boutique with frosted glass and golden accents.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '5',
    imageUrl: '/door-1.jpg',
    location: 'Rue Mouffetard',
    neighborhood: 'Latin Quarter',
    arrondissement: '5th',
    material: 'Wood',
    color: 'Natural Wood',
    style: 'Vintage',
    ornamentation: ['Wood Carving', 'Moldings', 'Door Knocker'],
    description: 'Ancient door with a rich history, preserved in its original state with authentic hardware.',
    isFavorite: true,
    addedBy: 'preset'
  },
  {
    id: '6',
    imageUrl: '/door-2.jpg',
    location: 'Place du Trocadéro',
    neighborhood: 'Trocadéro',
    arrondissement: '16th',
    material: 'Stone',
    color: 'Grey',
    style: 'Classic',
    ornamentation: ['Columns', 'Pediment'],
    description: 'Majestic dressed stone entrance with ornamental sculptures typical of French classical architecture.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '7',
    imageUrl: '/door-3.jpg',
    location: 'Rue de la Bastille',
    neighborhood: 'Bastille',
    arrondissement: '11th',
    material: 'Metal',
    color: 'Red/Burgundy',
    style: 'Industrial',
    ornamentation: ['Ironwork'],
    description: 'Modern industrial style with raw metallic elements and vibrant red color.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '8',
    imageUrl: '/door-4.jpg',
    location: 'Avenue de l\'Opéra',
    neighborhood: 'Opéra',
    arrondissement: '2nd',
    material: 'Wood',
    color: 'Black',
    style: 'Haussmann',
    ornamentation: ['Wood Carving', 'Moldings', 'Pediment'],
    description: 'Carefully restored Haussmannian door, maintaining its original elegance while integrating contemporary elements.',
    isFavorite: true,
    addedBy: 'preset'
  },
  {
    id: '9',
    imageUrl: '/door-1.jpg',
    location: 'Boulevard de Clichy',
    neighborhood: 'Pigalle',
    arrondissement: '9th',
    material: 'Composite',
    color: 'Yellow',
    style: 'Modern',
    ornamentation: [],
    description: 'Avant-garde design using composite materials with a sophisticated matte finish.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '10',
    imageUrl: '/door-2.jpg',
    location: 'Rue de Belleville',
    neighborhood: 'Belleville',
    arrondissement: '20th',
    material: 'Wood',
    color: 'Multicolor',
    style: 'Vintage',
    ornamentation: ['Stained Glass', 'Flowers'],
    description: 'Authentic vintage door from the popular Belleville district, witness to the working-class history of the 20th arrondissement.',
    isFavorite: false,
    addedBy: 'preset'
  }
];