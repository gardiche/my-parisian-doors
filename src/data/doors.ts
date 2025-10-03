import { Door } from '@/types/door';
import door1 from '@/assets/door-1.jpg';
import door2 from '@/assets/door-2.jpg';
import door3 from '@/assets/door-3.jpg';
import door4 from '@/assets/door-4.jpg';

export const doors: Door[] = [
  {
    id: '1',
    imageUrl: door1,
    location: '42 Rue de Rivoli',
    neighborhood: 'Le Marais',
    material: 'Wood',
    color: 'Green',
    style: 'Haussmann',
    description: 'Elegant Haussmann-era door with original brass hardware and intricate wooden panels.',
    isFavorite: false,
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: '2',
    imageUrl: door2,
    location: '15 Avenue des Champs-Élysées',
    neighborhood: 'Champs-Élysées',
    material: 'Wood',
    color: 'Cream',
    style: 'Classic',
    description: 'Beautiful double doors with glass panels and wrought iron details.',
    isFavorite: false,
    coordinates: { lat: 48.8698, lng: 2.3076 }
  },
  {
    id: '3',
    imageUrl: door3,
    location: '8 Place du Tertre',
    neighborhood: 'Montmartre',
    material: 'Wood',
    color: 'Blue',
    style: 'Vintage',
    description: 'Charming weathered door in the heart of artistic Montmartre.',
    isFavorite: false,
    coordinates: { lat: 48.8867, lng: 2.3407 }
  },
  {
    id: '4',
    imageUrl: door4,
    location: '23 Rue de la Paix',
    neighborhood: 'Opéra',
    material: 'Metal',
    color: 'Black',
    style: 'Modern',
    description: 'Contemporary geometric design with clean lines and minimalist aesthetic.',
    isFavorite: false,
    coordinates: { lat: 48.8686, lng: 2.3314 }
  }
];