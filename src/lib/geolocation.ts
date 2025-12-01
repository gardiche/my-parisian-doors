// Enhanced geolocation utilities for iOS/Safari compatibility

export interface GeolocationError {
  code: number;
  message: string;
  iosInstructions?: string;
}

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isChromeIOS = (): boolean => {
  return /CriOS/.test(navigator.userAgent);
};

export const getBrowserName = (): string => {
  if (isChromeIOS()) return 'Chrome';
  if (isSafari()) return 'Safari';
  if (/Firefox/i.test(navigator.userAgent)) return 'Firefox';
  if (/Edg/i.test(navigator.userAgent)) return 'Edge';
  return 'votre navigateur';
};

export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:' ||
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

export const checkGeolocationSupport = (): {
  supported: boolean;
  error?: string;
  needsHTTPS?: boolean;
} => {
  if (!('geolocation' in navigator)) {
    return {
      supported: false,
      error: 'Votre navigateur ne supporte pas la géolocalisation'
    };
  }

  // iOS Safari requires HTTPS (except for localhost)
  if ((isIOS() || isSafari()) && !isSecureContext()) {
    return {
      supported: false,
      needsHTTPS: true,
      error: 'La géolocalisation nécessite une connexion HTTPS sur iOS/Safari'
    };
  }

  return { supported: true };
};

export const getGeolocationErrorMessage = (error: GeolocationPositionError): GeolocationError => {
  const isAppleDevice = isIOS() || isSafari();
  const browser = getBrowserName();

  switch (error.code) {
    case 1: // PERMISSION_DENIED
      let instructions = '';

      if (isChromeIOS()) {
        instructions = 'Réglages → Chrome → Localisation → Lors de l\'utilisation';
      } else if (isSafari() || isIOS()) {
        instructions = 'Réglages → Safari → Localisation → Autoriser';
      }

      return {
        code: 1,
        message: isAppleDevice
          ? `Accès GPS refusé. Veuillez autoriser l'accès dans les réglages de ${browser}.`
          : 'Accès GPS refusé',
        iosInstructions: instructions || undefined
      };

    case 2: // POSITION_UNAVAILABLE
      return {
        code: 2,
        message: 'Position GPS indisponible. Vérifiez que le GPS est activé.',
        iosInstructions: isAppleDevice
          ? 'Réglages → Confidentialité → Service de localisation → Activé'
          : undefined
      };

    case 3: // TIMEOUT
      return {
        code: 3,
        message: 'Délai de localisation dépassé. Réessayez.',
      };

    default:
      return {
        code: error.code,
        message: 'Erreur de géolocalisation inconnue',
      };
  }
};

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const getCurrentPosition = async (
  options?: GeolocationOptions
): Promise<GeolocationPosition> => {
  // Check support first
  const supportCheck = checkGeolocationSupport();
  if (!supportCheck.supported) {
    throw new Error(supportCheck.error || 'Geolocation not supported');
  }

  // iOS-optimized options
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: isIOS() ? 10000 : 15000, // Shorter timeout for iOS
    maximumAge: 0, // Always get fresh position
    ...options
  };

  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      defaultOptions
    );
  });
};

export const watchPosition = (
  successCallback: PositionCallback,
  errorCallback?: PositionErrorCallback,
  options?: GeolocationOptions
): number | null => {
  const supportCheck = checkGeolocationSupport();
  if (!supportCheck.supported) {
    console.error(supportCheck.error);
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: isIOS() ? 10000 : 15000,
    maximumAge: 5000, // Cache for 5 seconds when watching
    ...options
  };

  return navigator.geolocation.watchPosition(
    successCallback,
    errorCallback,
    defaultOptions
  );
};

export const clearWatch = (watchId: number | null): void => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
};
