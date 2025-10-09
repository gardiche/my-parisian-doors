// src/types/door.ts

export type DoorMaterial = 'Wood' | 'Metal' | 'Glass' | 'Stone' | 'Composite';
export type DoorColor = 'Green' | 'Blue' | 'Black' | 'White' | 'Cream' | 'Brown' | 'Red' | 'Gray';
export type DoorStyle = 'Haussmann' | 'Art Nouveau' | 'Modern' | 'Vintage' | 'Industrial' | 'Classic';
export type DoorArrondissement = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th' | '9th' | '10th' | '11th' | '12th' | '13th' | '14th' | '15th' | '16th' | '17th' | '18th' | '19th' | '20th';
export type DoorOrnamentation = 'Ironwork' | 'Stained Glass' | 'Wood Carving' | 'Columns' | 'Pediment' | 'Door Knocker' | 'Moldings' | 'Flowers';

export interface Door {
  id: string;
  imageUrl: string;
  location: string;
  neighborhood: string;
  material: DoorMaterial;
  color: DoorColor;
  style: DoorStyle;
  arrondissement?: DoorArrondissement;
  ornamentations?: DoorOrnamentation[];
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

// Sample data with your door images (English)
export const sampleDoors: Door[] = [
  {
    id: '1',
    imageUrl: '/door-1.jpg',
    location: 'Rue des Rosiers',
    neighborhood: 'Le Marais',
    material: 'Wood',
    color: 'Green',
    style: 'Haussmann',
    arrondissement: '4th',
    ornamentations: ['Wood Carving', 'Door Knocker'],
    description: 'A magnificent Haussmannian door with complex carved details and a green patina characteristic of the Marais district.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '2',
    imageUrl: '/door-2.jpg',
    location: 'Place du Tertre',
    neighborhood: 'Montmartre',
    material: 'Wood',
    color: 'Blue',
    style: 'Art Nouveau',
    arrondissement: '18th',
    ornamentations: ['Stained Glass', 'Ironwork'],
    description: 'Art Nouveau door with delicate floral motifs, typical of early 20th century Montmartre architecture.',
    isFavorite: true,
    addedBy: 'preset'
  },
  {
    id: '3',
    imageUrl: '/door-3.jpg',
    location: 'Boulevard Saint-Germain',
    neighborhood: 'Saint-Germain',
    material: 'Metal',
    color: 'Black',
    style: 'Modern',
    arrondissement: '6th',
    ornamentations: [],
    description: 'Contemporary minimalist design with bold geometric lines, perfectly integrated into the Parisian urban landscape.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '4',
    imageUrl: '/door-4.jpg',
    location: 'Avenue des Champs-Élysées',
    neighborhood: 'Champs-Élysées',
    material: 'Glass',
    color: 'White',
    style: 'Modern',
    arrondissement: '8th',
    ornamentations: ['Columns'],
    description: 'Luxurious entrance to a prestigious boutique with frosted glass and golden accents.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '5',
    imageUrl: '/door-1.jpg',
    location: 'Rue Mouffetard',
    neighborhood: 'Latin Quarter',
    material: 'Wood',
    color: 'Brown',
    style: 'Vintage',
    arrondissement: '5th',
    ornamentations: ['Door Knocker', 'Moldings'],
    description: 'Ancient door with a rich history, preserved in its original state with authentic hardware.',
    isFavorite: true,
    addedBy: 'preset'
  },
  {
    id: '6',
    imageUrl: '/door-2.jpg',
    location: 'Place du Trocadéro',
    neighborhood: 'Trocadéro',
    material: 'Stone',
    color: 'Cream',
    style: 'Classic',
    arrondissement: '16th',
    ornamentations: ['Columns', 'Pediment'],
    description: 'Majestic dressed stone entrance with ornamental sculptures typical of French classical architecture.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '7',
    imageUrl: '/door-3.jpg',
    location: 'Rue de la Bastille',
    neighborhood: 'Bastille',
    material: 'Metal',
    color: 'Red',
    style: 'Industrial',
    arrondissement: '11th',
    ornamentations: ['Ironwork'],
    description: 'Modern industrial style with raw metallic elements and vibrant red color.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '8',
    imageUrl: '/door-4.jpg',
    location: 'Avenue de l\'Opéra',
    neighborhood: 'Opéra',
    material: 'Wood',
    color: 'Black',
    style: 'Haussmann',
    arrondissement: '9th',
    ornamentations: ['Wood Carving', 'Moldings'],
    description: 'Carefully restored Haussmannian door, maintaining its original elegance while integrating contemporary elements.',
    isFavorite: true,
    addedBy: 'preset'
  },
  {
    id: '9',
    imageUrl: '/door-1.jpg',
    location: 'Boulevard de Clichy',
    neighborhood: 'Pigalle',
    material: 'Composite',
    color: 'Gray',
    style: 'Modern',
    arrondissement: '18th',
    ornamentations: [],
    description: 'Avant-garde design using composite materials with a sophisticated matte finish.',
    isFavorite: false,
    addedBy: 'preset'
  },
  {
    id: '10',
    imageUrl: '/door-2.jpg',
    location: 'Rue de Belleville',
    neighborhood: 'Belleville',
    material: 'Wood',
    color: 'Green',
    style: 'Vintage',
    arrondissement: '20th',
    ornamentations: ['Flowers', 'Ironwork'],
    description: 'Authentic vintage door from the popular Belleville district, witness to the working-class history of the 20th arrondissement.',
    isFavorite: false,
    addedBy: 'preset'
  }
];