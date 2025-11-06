/**
 * Confetti Hook
 * Provides celebration confetti effects
 */

import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const lastCelebrationRef = useRef<number>(0);
  
  const celebrate = useCallback(() => {
    // Prevent multiple celebrations within 1 second (debounce)
    const now = Date.now();
    if (now - lastCelebrationRef.current < 1000) {
      console.log('🎊 Confetti debounced - too soon since last celebration');
      return;
    }
    lastCelebrationRef.current = now;

    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 1000,
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB', '#32CD32']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Fire confetti from multiple angles
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const celebrateFromElement = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Burst of confetti from the element
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB', '#32CD32']
    });

    // Additional sparkle burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x, y },
      colors: ['#FFD700', '#FFFF00', '#FFF']
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x, y },
      colors: ['#FFD700', '#FFFF00', '#FFF']
    });
  }, []);

  const sparkle = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFFF00', '#FFA500']
    });
  }, []);

  return {
    celebrate,
    celebrateFromElement,
    sparkle,
  };
};

