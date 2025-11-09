import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import splashAnimation from '@/assets/animations/splash-screen.json';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Duration of splash screen (adjust as needed)
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Wait for fade out animation
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full max-w-md px-8">
        <Lottie
          animationData={splashAnimation}
          loop={false}
          autoplay={true}
        />
      </div>
    </div>
  );
}
