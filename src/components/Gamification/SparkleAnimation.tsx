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
    const particleCount = 50; // Increased from 30
    const particles: HTMLDivElement[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'sparkle-particle';
      
      // Random position around the center with more variation
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 30 + Math.random() * 120; // More variation
      const startX = Math.cos(angle) * distance;
      const startY = Math.sin(angle) * distance;
      
      // Random delay with more stagger
      const delay = Math.random() * 0.5; // Increased from 0.3
      
      particle.style.setProperty('--start-x', `${startX}px`);
      particle.style.setProperty('--start-y', `${startY}px`);
      particle.style.setProperty('--delay', `${delay}s`);
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // Cleanup after animation (extended duration)
    const timeout = setTimeout(() => {
      particles.forEach(particle => particle.remove());
      if (onComplete) {
        onComplete();
      }
    }, 2000); // Increased from 1500

    return () => {
      clearTimeout(timeout);
      particles.forEach(particle => particle.remove());
    };
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return <div ref={containerRef} className="sparkle-container" />;
};

