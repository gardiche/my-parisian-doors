// src/components/AddDoorForm.tsx
import React, { useState, useRef } from 'react';
import { Door, DoorMaterial, DoorColor, DoorStyle } from '@/types/door';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Camera, 
  Upload, 
  MapPin, 
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddDoorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoor: (door: Omit<Door, 'id'>) => void;
}

const materials: DoorMaterial[] = ['Wood', 'Metal', 'Glass', 'Stone', 'Composite'];
const colors: DoorColor[] = ['Green', 'Blue', 'Black', 'White', 'Cream', 'Brown', 'Red', 'Gray'];
const styles: DoorStyle[] = ['Haussmann', 'Art Nouveau', 'Modern', 'Vintage', 'Industrial', 'Classic'];

export function AddDoorForm({ isOpen, onClose, onAddDoor }: AddDoorFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    location: '',
    neighborhood: '',
    material: '' as DoorMaterial,
    color: '' as DoorColor,
    style: '' as DoorStyle,
    description: ''
  });

  // Image and location state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{original: number, compressed: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Reset form
  const resetForm = () => {
    setFormData({
      location: '',
      neighborhood: '',
      material: '' as DoorMaterial,
      color: '' as DoorColor,
      style: '' as DoorStyle,
      description: ''
    });
    setImageFile(null);
    setImagePreview('');
    setCompressionInfo(null);
    setLocationError('');
    setLocationSuccess(false);
    setGpsCoordinates(null);
  };

  // Handle image selection with compression
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width, maintain aspect ratio)
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.8 = 80% quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      
      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setIsCompressing(true);
      
      try {
        const originalSize = file.size;
        
        // Compress image and create preview
        const compressedImage = await compressImage(file);
        
        // Calculate compressed size (rough estimation from base64)
        const compressedSize = Math.round((compressedImage.length * 3) / 4);
        
        setImagePreview(compressedImage);
        setCompressionInfo({
          original: originalSize,
          compressed: compressedSize
        });
        
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // Get current location with improved geocoding
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your device');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError('');
    setLocationSuccess(false);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Save GPS coordinates
      setGpsCoordinates({ lat: latitude, lng: longitude });

      // Reverse geocoding with Nominatim (OpenStreetMap - gratuit)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MyParisianDoors/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract address components
        const addr = data.address || {};
        const houseNumber = addr.house_number || '';
        const road = addr.road || addr.street || '';
        const quarter = addr.quarter || addr.suburb || addr.neighbourhood || addr.district || '';
        
        // Build location string
        let locationStr = '';
        if (houseNumber && road) {
          locationStr = `${houseNumber} ${road}`;
        } else if (road) {
          locationStr = road;
        } else {
          locationStr = data.display_name?.split(',')[0] || 'Adresse trouvée';
        }
        
        setFormData(prev => ({
          ...prev,
          location: locationStr,
          neighborhood: quarter || 'Paris'
        }));
        
        setLocationSuccess(true);
        
        // Auto-hide success message after 3s
        setTimeout(() => setLocationSuccess(false), 3000);
        
      } else {
        // Fallback to coordinates
        setFormData(prev => ({
          ...prev,
          location: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          neighborhood: 'Paris'
        }));
        setLocationSuccess(true);
      }
    } catch (error: any) {
      if (error.code === 1) {
        setLocationError('Autorisation GPS refusée');
      } else if (error.code === 2) {
        setLocationError('Position GPS indisponible');
      } else if (error.code === 3) {
        setLocationError('Délai GPS dépassé');
      } else {
        setLocationError('Erreur de géolocalisation');
      }
      console.error('Geolocation error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!imageFile) {
      alert('Please add a photo');
      return;
    }
    
    if (!formData.location || !formData.neighborhood || !formData.material || !formData.color || !formData.style) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the already compressed image from preview
      const imageDataUrl = imagePreview;

      // Create new door object
      const newDoor: Omit<Door, 'id'> = {
        imageUrl: imageDataUrl,
        location: formData.location,
        neighborhood: formData.neighborhood,
        material: formData.material,
        color: formData.color,
        style: formData.style,
        description: formData.description,
        isFavorite: false,
        coordinates: gpsCoordinates || undefined,
        dateAdded: new Date().toISOString(),
        addedBy: 'user'
      };

      onAddDoor(newDoor);
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error adding door:', error);
      alert('Error adding door');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = imageFile && formData.location && formData.neighborhood && 
                     formData.material && formData.color && formData.style;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Add a Door
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Door Photo
            </h3>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    setCompressionInfo(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                {/* Compression info */}
                {compressionInfo && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {(compressionInfo.original / 1024).toFixed(0)}KB → {(compressionInfo.compressed / 1024).toFixed(0)}KB
                    <span className="text-green-300 ml-1">
                      (-{Math.round((1 - compressionInfo.compressed / compressionInfo.original) * 100)}%)
                    </span>
                  </div>
                )}
                
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Compressing...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                  Take a photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Choose from gallery
                </Button>
              </div>
            )}
            
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </Card>

          {/* Location Section */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {isLoadingLocation ? 'Locating...' : 'Use My GPS Position'}
              </Button>
              
              {locationError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}
              
              {locationSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Position captured! Check and add door number if needed.</span>
                </div>
              )}
              
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Address *
                    <span className="text-xs text-muted-foreground ml-1">(add number if missing)</span>
                  </label>
                  <Input
                    placeholder="e.g.: 42 Rue de Rivoli"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Neighborhood *</label>
                  <Input
                    placeholder="e.g.: Le Marais"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              {gpsCoordinates && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  GPS: {gpsCoordinates.lat.toFixed(6)}, {gpsCoordinates.lng.toFixed(6)}
                </div>
              )}
            </div>
          </Card>

          {/* Door Properties */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Characteristics</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Material *</label>
                <Select
                  value={formData.material}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, material: value as DoorMaterial }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map(material => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Color *</label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value as DoorColor }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Style *</label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, style: value as DoorStyle }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map(style => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1 block">Description (optional)</label>
            <Textarea
              placeholder="Describe this door, its history, what makes it special..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isSubmitting ? 'Adding...' : 'Add Door'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}