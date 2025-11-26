import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollFadeOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollFade(options: ScrollFadeOptions = {}) {
  const { 
    threshold = 0.1, 
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = false 
  } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (triggerOnce && hasTriggered) return;
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) setHasTriggered(true);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, isVisible };
}

export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress from 0 to 1
      // 0 = element just entered viewport from bottom
      // 1 = element has left viewport from top
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Progress based on element position relative to viewport center
      const visibleProgress = 1 - (elementTop / (windowHeight + elementHeight));
      setProgress(Math.max(0, Math.min(1, visibleProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, progress };
}

interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  triggerOnce?: boolean;
}

export function ScrollFade({ 
  children, 
  className = '',
  delay = 0,
  direction = 'up',
  distance = 30,
  duration = 0.6,
  triggerOnce = true
}: ScrollFadeProps) {
  const { ref, isVisible } = useScrollFade({ triggerOnce });

  const getTransform = useCallback(() => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    
    switch (direction) {
      case 'up': return `translate3d(0, ${distance}px, 0)`;
      case 'down': return `translate3d(0, -${distance}px, 0)`;
      case 'left': return `translate3d(${distance}px, 0, 0)`;
      case 'right': return `translate3d(-${distance}px, 0, 0)`;
      case 'none': return 'translate3d(0, 0, 0)';
    }
  }, [isVisible, direction, distance]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
