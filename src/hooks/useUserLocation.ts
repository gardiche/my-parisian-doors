import { useState, useEffect } from 'react';
import { getCurrentPosition } from '@/lib/geolocation';

interface UserLocation {
  lat: number;
  lng: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    getCurrentPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 })
      .then(pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }))
      .catch(() => {});
  }, []);

  return location;
}

export function formatDistance(userLat: number, userLng: number, doorLat: number, doorLng: number): string {
  const R = 6371000;
  const dLat = (doorLat - userLat) * Math.PI / 180;
  const dLng = (doorLng - userLng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(doorLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const meters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
