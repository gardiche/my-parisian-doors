import { useState } from 'react';
import Lottie from 'lottie-react';
import splashAnimation from '@/assets/animations/splash-screen.json';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAnimationComplete = () => {
    // Wait a moment before fading out
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Wait for fade out animation
    }, 500);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full h-full">
        <Lottie
          animationData={splashAnimation}
          loop={false}
          autoplay={true}
          onComplete={handleAnimationComplete}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
