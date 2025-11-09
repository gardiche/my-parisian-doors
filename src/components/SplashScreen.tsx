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
      className={`fixed inset-0 z-[9999] bg-background transition-opacity duration-300 m-0 p-0 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Lottie
        animationData={splashAnimation}
        loop={false}
        autoplay={true}
        onComplete={handleAnimationComplete}
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          display: 'block'
        }}
      />
    </div>
  );
}
