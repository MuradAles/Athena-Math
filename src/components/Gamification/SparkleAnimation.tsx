/**
 * Sparkle Animation Component
 * Particle effect for celebrating correct answers
 */

import { useEffect, useRef } from 'react';
import './SparkleAnimation.css';

interface SparkleAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const SparkleAnimation = ({ trigger, onComplete }: SparkleAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 30;
    const particles: HTMLDivElement[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'sparkle-particle';
      
      // Random position around the center
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 50 + Math.random() * 100;
      const startX = Math.cos(angle) * distance;
      const startY = Math.sin(angle) * distance;
      
      // Random delay
      const delay = Math.random() * 0.3;
      
      particle.style.setProperty('--start-x', `${startX}px`);
      particle.style.setProperty('--start-y', `${startY}px`);
      particle.style.setProperty('--delay', `${delay}s`);
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // Cleanup after animation
    const timeout = setTimeout(() => {
      particles.forEach(particle => particle.remove());
      if (onComplete) {
        onComplete();
      }
    }, 1500);

    return () => {
      clearTimeout(timeout);
      particles.forEach(particle => particle.remove());
    };
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return <div ref={containerRef} className="sparkle-container" />;
};

